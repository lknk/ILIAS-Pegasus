/** angular */
import {Component, Inject} from "@angular/core";
/** ionic-native */
import {AppVersion} from "@ionic-native/app-version/ngx";
import {InAppBrowserObject} from "@ionic-native/in-app-browser/ngx";
import {AlertController, Events, Platform} from "@ionic/angular";
import {CONFIG_PROVIDER, ILIASConfigProvider, ILIASInstallation} from "../../config/ilias-config";
import {Settings} from "../../models/settings";
/** models */
import {User} from "../../models/user";
import {AuthenticationProvider} from "../../providers/authentification/authentication.provider";
/** logging */
import {Log} from "../../services/log.service";
/** misc */
import {SynchronizationService} from "../../services/synchronization.service";
import {ThemeService} from "../../services/theme.service";

@Component({
    templateUrl: "login.html"
})
export class LoginPage {

    readonly installations: Array<ILIASInstallation> = [];

    /**
     * Selected installation id
     */
    installationId: number;
    readonly appVersionStr: Promise<string>;

    constructor(private readonly platform: Platform,
                private readonly sync: SynchronizationService,
                @Inject(CONFIG_PROVIDER) private readonly configProvider: ILIASConfigProvider,
                private readonly event: Events,
                private readonly appVersionPlugin: AppVersion,
                private readonly auth: AuthenticationProvider,
                private readonly alertCtr: AlertController
    ) {
      this.configProvider.loadConfig().then(config => {
          this.installations.push(...config.installations);
          this.installationId = this.installations[0].id;
      });

      this.appVersionStr = this.appVersionPlugin.getVersionNumber();
    }

    ionViewWillEnter(): void {
        ThemeService.setDefaultColor();
    }

    login(): void {
        if(!this.checkOnline()) return;
        const installation: ILIASInstallation = this.getSelectedInstallation();
        const browser: InAppBrowserObject = this.auth.browserLogin(installation);

        browser.on("exit").subscribe(() => {
            Log.write(this, "exit browser");
            if(AuthenticationProvider.isLoggedIn()) {
                this.checkAndLoadOfflineContent()
                    .then(() => this.sync.resetOfflineSynchronization(true))
                    .then(() => this.updateLastVersionLogin())
                    .then(() => ThemeService.setCustomColor());
            }
        });
    }

    /**
     * if the device is offline, inform the user with an alert and return false
     */
    private checkOnline(): boolean {
        if(!window.navigator.onLine) {
            this.alertCtr.create({
                header: "TODO title-offline",
                message: "TODO msg-no-login-when-offline",
                buttons: [
                    {text: "Ok"}
                ]
            }).then((alert: HTMLIonAlertElement) => alert.present());
            return false;
        }
        return true;
    }

    /**
     * update the value lastVersionLogin for the user after login
     */
    private async updateLastVersionLogin(): Promise<void> {
        const user: User = AuthenticationProvider.getUser();
        user.lastVersionLogin = await this.appVersionStr;
        await user.save();
    }

    /**
     * if downloadOnStart is enabled, synchronize all offline-data after login
     */
    private async checkAndLoadOfflineContent(): Promise<void> {
        const user: User = AuthenticationProvider.getUser();
        const settings: Settings = await Settings.findByUserId(user.id);
        if (settings.downloadOnStart && window.navigator.onLine) this.sync.loadAllOfflineContent();
    }

    /**
     * @returns {ILIASInstallation}
     */
    protected getSelectedInstallation(): ILIASInstallation {
        return this.installations.filter(installation => {
            return (installation.id == this.installationId);
        })[0];
    }

}
