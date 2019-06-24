import { Inject, Injectable, Renderer2, RendererFactory2, PLATFORM_ID, ElementRef, NgZone, ComponentFactoryResolver, ComponentFactory, Injector, ViewContainerRef, ComponentRef } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { CustomClass } from './config';
import { ResizableDirective } from 'angular-resizable-element';
import { createCustomElement } from '@angular/elements';
import { EditorResizableImgComponent, EditorResizableImgConfig } from './components/editor-img/editor-img.component';

export interface UploadResponse {
  imageUrl: string;
}

@Injectable()
export class AngularEditorService {

  savedSelection: Range | null;
  selectedText: string;
  uploadUrl: string;

  private _renderer: Renderer2;

  constructor(private injector: Injector, private componentFactoryResolver: ComponentFactoryResolver, rendererFactory: RendererFactory2, @Inject(PLATFORM_ID) private platformId: any, private zone: NgZone, private http: HttpClient, @Inject(DOCUMENT) private _document: any) {
    this._renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Executed command from editor header buttons exclude toggleEditorMode
   * @param command string from triggerCommand
   */
  executeCommand(command: string) {
    const commands = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre'];
    if (commands.includes(command)) {
      this._document.execCommand('formatBlock', false, command);
    }

    this._document.execCommand(command, false, null);
  }

  /**
   * Create URL link
   * @param url string from UI prompt
   */
  createLink(url: string) {
    if (!url.includes('http')) {
      this._document.execCommand('createlink', false, url);
    } else {
      const newUrl = '<a href="' + url + '" target="_blank">' + this.selectedText + '</a>';
      this.insertHtml(newUrl);
    }
  }

  /**
   * insert color either font or background
   *
   * @param color color to be inserted
   * @param where where the color has to be inserted either text/background
   */
  insertColor(color: string, where: string): void {
    const restored = this.restoreSelection();
    if (restored) {
      if (where === 'textColor') {
        this._document.execCommand('foreColor', false, color);
      } else {
        this._document.execCommand('hiliteColor', false, color);
      }
    }
  }

  /**
   * Set font name
   * @param fontName string
   */
  setFontName(fontName: string) {
    this._document.execCommand('fontName', false, fontName);
  }

  /**
   * Set font size
   * @param fontSize string
   */
  setFontSize(fontSize: string) {
    this._document.execCommand('fontSize', false, fontSize);
  }

  /**
   * Create raw HTML
   * @param html HTML string
   */
  private insertHtml(html: string): void {

    const isHTMLInserted = this._document.execCommand('insertHTML', false, html);

    if (!isHTMLInserted) {
      throw new Error('Unable to perform the operation');
    }
  }

  /**
   * save selection when the editor is focussed out
   */
  saveSelection(): any {
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        this.savedSelection = sel.getRangeAt(0);
        this.selectedText = sel.toString();
      }
    } else if (this._document.getSelection && this._document.createRange) {
      this.savedSelection = document.createRange();
    } else {
      this.savedSelection = null;
    }
  }

  /**
   * restore selection when the editor is focussed in
   *
   * saved selection when the editor is focussed out
   */
  restoreSelection(): boolean {
    if (this.savedSelection) {
      if (window.getSelection) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(this.savedSelection);
        return true;
      } else if (this._document.getSelection /*&& this.savedSelection.select*/) {
        // this.savedSelection.select();
        return true;
      }
    } else {
      return false;
    }
  }

  /** check any slection is made or not */
  private checkSelection(): any {

    const slectedText = this.savedSelection.toString();

    if (slectedText.length === 0) {
      throw new Error('No Selection Made');
    }

    return true;
  }

  /**
   * Upload file to uploadUrl
   * @param file
   */
  uploadImage(file: File): Observable<HttpEvent<UploadResponse>> {

    const uploadData: FormData = new FormData();

    uploadData.append('file', file, file.name);

    return this.http.post<UploadResponse>(this.uploadUrl, uploadData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  private replaceSelectedText(replacementNode: Node) {
    let sel, range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(replacementNode);
        window.getSelection().removeAllRanges();
      }
    }

  }

  /**
   * Insert image with Url
   * @param imageUrl
   */
  insertImage(imageUrl: string, vcRef: ViewContainerRef, config?: EditorResizableImgConfig): ComponentRef<EditorResizableImgComponent> {
    /**
     * mwlResizable
      [enableGhostResize]="true"
      [resizeEdges]="{bottom: true, right: true, top: true, left: true}"
      (resizeEnd)="onResizeEnd($event)"
     */

    const factory: ComponentFactory<EditorResizableImgComponent> = this.componentFactoryResolver.resolveComponentFactory(EditorResizableImgComponent);
    const imgContainer = this._renderer.createElement('span') as HTMLElement;
    this.replaceSelectedText(imgContainer);
    const img = vcRef.createComponent(factory);
    img.instance.src = imageUrl;
    img.instance.config = config;
    imgContainer.appendChild((img.instance.elm.nativeElement as HTMLElement));
    return img;
    /*const img = this._renderer.createElement('img') as HTMLElement;
    img.setAttribute('src', imageUrl);
    img.setAttribute('mwlResizable', 'true');
    img.style.width = '100px';

    this.replaceSelectedText(img);*/

  }

  setDefaultParagraphSeparator(separator: string) {
    this._document.execCommand('defaultParagraphSeparator', false, separator);
  }

  createCustomClass(customClass: CustomClass) {
    let newTag = this.selectedText;
    if (customClass) {
      const tagName = customClass.tag ? customClass.tag : 'span';
      newTag = '<' + tagName + ' class="' + customClass.class + '">' + this.selectedText + '</' + tagName + '>';
    }

    this.insertHtml(newTag);
  }
}
