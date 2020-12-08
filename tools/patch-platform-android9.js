/** serve --ssl => certificatSetup es
 * enables live loading for android9-devices
 */

const fs = require("fs");

replaceInFile(
    "platforms/android/app/src/main/AndroidManifest.xml",
    /<application/g,
    "network_security_config",
    '<application android:networkSecurityConfig="@xml/network_security_config"'
);
includeNetSecConfig();

function includeNetSecConfig() {
    fs.copyFile('resources/android/xml/network_security_config.xml',
        'platforms/android/app/src/main/res/xml/network_security_config.xml',
        (err) => { if (err) throw  err; });
}

function replaceInFile(file, match, check, replace) {
    fs.readFile(file, "utf8", function (err,data) {
        if (err) throw err;
        if (!data.includes(check)) {
            let result = data.replace(match, replace);
            fs.writeFile(file, result, "utf8", function (err) {
                if (err) throw  err;
            });
        }
    });
}
