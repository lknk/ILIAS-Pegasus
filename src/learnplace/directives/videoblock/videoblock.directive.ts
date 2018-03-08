import {ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {VideoBlockModel} from "../../services/block.model";
import {Platform} from "ionic-angular";
import {File} from "@ionic-native/file";
import {StreamingMedia} from "@ionic-native/streaming-media";
import {Observable} from "rxjs/Observable";

@Component({
  selector: "video-block",
  templateUrl: "video-block.html"
})
export class VideoBlock implements OnInit {

  @Input("value")
  readonly observableVideoBlock: Observable<VideoBlockModel>;

  videoBlock: VideoBlockModel | undefined = undefined;

  constructor(
    private readonly platform: Platform,
    private readonly file: File,
    private readonly streaming: StreamingMedia,
    private readonly detectorRef: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.observableVideoBlock.subscribe(it => {
      this.videoBlock = it;
      this.detectorRef.detectChanges();
    })
  }

  play(): void {
    this.streaming.playVideo(`${this.getStorageLocation()}${this.videoBlock.url}`);
  }

  private getStorageLocation(): string {
    if (this.platform.is("android")) {
      return this.file.externalApplicationStorageDirectory;
    }
    if (this.platform.is("ios")) {
      return this.file.dataDirectory;
    }

    throw new Error("Unsupported platform. Can not return a storage location.");
  }
}
