import { Component, OnInit, Input, OnChanges, SimpleChanges, Attribute, ViewContainerRef, ElementRef, ViewChild, Output, EventEmitter, OnDestroy, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ResizeEvent } from 'angular-resizable-element';
export class EditorResizableImgConfig {
  resizable: boolean = true;
  width: number;
  height: number;
}

@Component({
  selector: 'editor-img',
  templateUrl: './editor-img.component.html',
  styleUrls: ['./editor-img.component.scss']
})
export class EditorResizableImgComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {


  @ViewChild('img', { static: true })
  img: ElementRef;

  @Input('src')
  public src: string;

  safeSrc: SafeHtml = '';

  @Input()
  resizable: boolean = true;

  @Input()
  config: EditorResizableImgConfig

  @Output()
  resizeEnd: EventEmitter<ResizeEvent> = new EventEmitter();

  @Output()
  ready: EventEmitter<EditorResizableImgComponent> = new EventEmitter();

  constructor(protected sanitizer: DomSanitizer, public elm: ElementRef, ) {
    ViewContainerRef
  }

  ngOnInit() {
    this.applyConfig();
    this.safeSrc = this.sanitizer.bypassSecurityTrustUrl(this.src);
    
  }

  ngAfterViewInit(): void {
    this.ready.emit();
  }

  applyConfig() {
    if (this.config) {
      const elm = this.img.nativeElement as HTMLElement;
      elm.style.width = this.config.width ? this.config.width + 'px' : '100px';
      elm.style.height = this.config.height ? this.config.height + 'px' : '100px';
    }
  }

  onResizeEnd(event: ResizeEvent): void {
    const elm = this.img.nativeElement as HTMLElement;
    elm.style.width = event.rectangle.width + 'px';
    elm.style.height = event.rectangle.height + 'px';
    this.resizeEnd.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src']) {
      this.safeSrc = this.sanitizer.bypassSecurityTrustUrl(changes['src'].currentValue);
    }
  }

  ngOnDestroy(): void {
    this.resizeEnd.complete();
    this.ready.complete();
  }
}


