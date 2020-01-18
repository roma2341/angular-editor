
import { EditorResizableImgComponent, EditorResizableImgConfig } from './components/editor-img/editor-img.component';
import {
  Injectable, Renderer2, ComponentFactoryResolver, RendererFactory2,
  Inject, ViewContainerRef, ComponentRef, ComponentFactory
} from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomClass, AngularEditorConfig } from './config';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

// tslint:disable-next-line: max-line-length
const PRELODER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ibGRzLWNhbWVyYSIgd2lkdGg9IjgwcHgiICBoZWlnaHQ9IjgwcHgiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTAsNTApIj4KPGcgdHJhbnNmb3JtPSJzY2FsZSgwLjcpIj4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTUwLC01MCkiPgo8ZyB0cmFuc2Zvcm09InJvdGF0ZSgyNzAuNzIgNTAgNTApIj4KICA8YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPSJ0cmFuc2Zvcm0iIHR5cGU9InJvdGF0ZSIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIHZhbHVlcz0iMzYwIDUwIDUwOzAgNTAgNTAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGtleVNwbGluZXM9IjAuNSAwLjUgMC41IDAuNSIgY2FsY01vZGU9InNwbGluZSI+PC9hbmltYXRlVHJhbnNmb3JtPgogIDxwYXRoIGZpbGw9IiNmMDUxMjUiIGQ9Ik01NC4zLDI4LjFoMzQuMmMtNC41LTkuMy0xMi40LTE2LjctMjEuOS0yMC44TDQ1LjcsMjguMUw1NC4zLDI4LjFMNTQuMywyOC4xeiI+PC9wYXRoPgogIDxwYXRoIGZpbGw9IiNmZGI4MTMiIGQ9Ik02MS43LDcuM0M1MS45LDQsNDEuMSw0LjIsMzEuNSw4LjF2MjkuNWw2LjEtNi4xTDYxLjcsNy4zQzYxLjcsNy4zLDYxLjcsNy4zLDYxLjcsNy4zeiI+PC9wYXRoPgogIDxwYXRoIGZpbGw9IiM3ZmJiNDIiIGQ9Ik0yOC4xLDExLjZjLTkuMyw0LjUtMTYuNywxMi40LTIwLjgsMjEuOWwyMC44LDIwLjh2LTguNkwyOC4xLDExLjZDMjguMSwxMS42LDI4LjEsMTEuNiwyOC4xLDExLjZ6Ij48L3BhdGg+CiAgPHBhdGggZmlsbD0iIzMyYTBkYSIgZD0iTTMxLjUsNjIuNEw3LjMsMzguM2MwLDAsMCwwLDAsMEM0LDQ4LjEsNC4yLDU4LjksOC4xLDY4LjVoMjkuNUwzMS41LDYyLjR6Ij48L3BhdGg+CiAgPHBhdGggZmlsbD0iI2YwNTEyNSIgZD0iTTQ1LjcsNzEuOUgxMS41YzAsMCwwLDAsMCwwYzQuNSw5LjMsMTIuNCwxNi43LDIxLjksMjAuOGwyMC44LTIwLjhINDUuN3oiPjwvcGF0aD4KICA8cGF0aCBmaWxsPSIjZmRiODEzIiBkPSJNNjIuNCw2OC41TDM4LjMsOTIuNmMwLDAsMCwwLDAsMGM5LjgsMy40LDIwLjYsMy4xLDMwLjItMC44VjYyLjRMNjIuNCw2OC41eiI+PC9wYXRoPgogIDxwYXRoIGZpbGw9IiM3ZmJiNDIiIGQ9Ik03MS45LDQ1Ljd2OC42djM0LjJjMCwwLDAsMCwwLDBjOS4zLTQuNSwxNi43LTEyLjQsMjAuOC0yMS45TDcxLjksNDUuN3oiPjwvcGF0aD4KICA8cGF0aCBmaWxsPSIjMzJhMGRhIiBkPSJNOTEuOSwzMS41QzkxLjksMzEuNSw5MS45LDMxLjUsOTEuOSwzMS41bC0yOS41LDBsMCwwbDYuMSw2LjFsMjQuMSwyNC4xYzAsMCwwLDAsMCwwIEM5Niw1MS45LDk1LjgsNDEuMSw5MS45LDMxLjV6Ij48L3BhdGg+CjwvZz48L2c+PC9nPjwvZz48L3N2Zz4=';

export interface UploadResponse {
  imageUrl: string;
}

@Injectable()
export class AngularEditorService {

  savedSelection: Range | null;
  selectedText: string;
  uploadUrl: string;

  private _renderer: Renderer2;

  constructor(
    private http: HttpClient,
    private componentFactoryResolver: ComponentFactoryResolver, rendererFactory: RendererFactory2, protected sanitizer: DomSanitizer,
    @Inject(DOCUMENT) private doc: any
  ) {
    this._renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Executed command from editor header buttons exclude toggleEditorMode
   * @param command string from triggerCommand
   */
  executeCommand(command: string) {
    const commands = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre'];
    if (commands.includes(command)) {
      this.doc.execCommand('formatBlock', false, command);
      return;
    }
    this.doc.execCommand(command, false, null);
  }

  /**
   * Create URL link
   * @param url string from UI prompt
   */
  createLink(url: string) {
    if (!url.includes('http')) {
      this.doc.execCommand('createlink', false, url);
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
        this.doc.execCommand('foreColor', false, color);
      } else {
        this.doc.execCommand('hiliteColor', false, color);
      }
    }
  }

  /**
   * Set font name
   * @param fontName string
   */
  setFontName(fontName: string) {
    this.doc.execCommand('fontName', false, fontName);
  }

  /**
   * Set font size
   * @param fontSize string
   */
  setFontSize(fontSize: string) {
    this.doc.execCommand('fontSize', false, fontSize);
  }

  /**
   * Create raw HTML
   * @param html HTML string
   */
  insertHtml(html: string): void {

    const isHTMLInserted = this.doc.execCommand('insertHTML', false, html);

    if (!isHTMLInserted) {
      throw new Error('Unable to perform the operation');
    }
  }

  /**
   * save selection when the editor is focussed out
   */
  public saveSelection = (): void => {
    if (this.doc.getSelection) {
      const sel = this.doc.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        this.savedSelection = sel.getRangeAt(0);
        this.selectedText = sel.toString();
      }
    } else if (this.doc.getSelection && this.doc.createRange) {
      this.savedSelection = document.createRange();
    } else {
      this.savedSelection = null;
    }
  }

  /**
   * restore selection when the editor is focused in
   *
   * saved selection when the editor is focused out
   */
  restoreSelection(): boolean {
    if (this.savedSelection) {
      if (this.doc.getSelection) {
        const sel = this.doc.getSelection();
        sel.removeAllRanges();
        sel.addRange(this.savedSelection);
        return true;
      } else if (this.doc.getSelection /*&& this.savedSelection.select*/) {
        // this.savedSelection.select();
        return true;
      }
    } else {
      return false;
    }
  }

  /**
   * setTimeout used for execute 'saveSelection' method in next event loop iteration
   */
  public executeInNextQueueIteration(callbackFn: (...args: any[]) => any, timeout = 1e2): void {
    setTimeout(callbackFn, timeout);
  }

  /** check any selection is made or not */
  private checkSelection(): any {

    const selectedText = this.savedSelection.toString();

    if (selectedText.length === 0) {
      throw new Error('No Selection Made');
    }
    return true;
  }

  /**
   * Upload file to uploadUrl
   * @param file The file
   */
  uploadImage(file: File): Observable<HttpEvent<UploadResponse>> {

    const uploadData: FormData = new FormData();

    uploadData.append('file', file, file.name);

    return this.http.post<UploadResponse>(this.uploadUrl, uploadData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  placeCaretAtEnd(el: HTMLElement) {
    el.focus();
    if (typeof window.getSelection != 'undefined'
      && typeof document.createRange != 'undefined') {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      return range;
    } else if (typeof (document.body as any).createTextRange != 'undefined') {
      const textRange = (document.body as any).createTextRange();
      textRange.moveToElementText(el);
      textRange.collapse(false);
      textRange.select();
      return textRange;
    }
  }

  private replaceSelectedText(replacementNode: Node, textArea: HTMLElement) {
    let sel: Selection, range: Range;
    let thisContext = false;

    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount) {
        range = sel.getRangeAt(0);
        let parentElm = range.commonAncestorContainer;

        while (parentElm = parentElm.parentElement) {
          if (parentElm == textArea) {
            thisContext = true;
            break;
          }
        }
      }

      if (!thisContext) {
        range = this.placeCaretAtEnd(textArea);
      }

      range.deleteContents();
      range.insertNode(replacementNode);
      window.getSelection().removeAllRanges();
    }
  }

  /**
   * Insert image with Url
   * @param imageUrl The imageUrl.
   */
  insertImage(angularEditorConfig: AngularEditorConfig, local: boolean, imageUrl: string, vcRef: ViewContainerRef, textArea: HTMLElement, config?: EditorResizableImgConfig): ComponentRef<EditorResizableImgComponent> {
    const factory: ComponentFactory<EditorResizableImgComponent> = this.componentFactoryResolver.resolveComponentFactory(EditorResizableImgComponent);
    const img = vcRef.createComponent(factory);
    img.instance.src = PRELODER_IMAGE;
    if (angularEditorConfig.imageProviderUrl && local == false) {
      angularEditorConfig.imageProviderUrl(imageUrl).subscribe(val => {
        img.instance.src = val;
        img.instance.safeSrc = this.sanitizer.bypassSecurityTrustUrl(val);
        setTimeout(() => img.instance.resizeEnd.next(null), 0);
      });
    } else {
      img.instance.src = imageUrl;
    }
    img.instance.config = config;
    this.replaceSelectedText((img.instance.elm.nativeElement as HTMLElement), textArea);
    this.placeCaretAtEnd(textArea);
    return img;
  }

  setDefaultParagraphSeparator(separator: string) {
    this.doc.execCommand('defaultParagraphSeparator', false, separator);
  }

  createCustomClass(customClass: CustomClass) {
    let newTag = this.selectedText;
    if (customClass) {
      const tagName = customClass.tag ? customClass.tag : 'span';
      newTag = '<' + tagName + ' class="' + customClass.class + '">' + this.selectedText + '</' + tagName + '>';
    }
    this.insertHtml(newTag);
  }

  insertVideo(videoUrl: string) {
    if (videoUrl.match('www.youtube.com')) {
      this.insertYouTubeVideoTag(videoUrl);
    }
    if (videoUrl.match('vimeo.com')) {
      this.insertVimeoVideoTag(videoUrl);
    }
  }

  private insertYouTubeVideoTag(videoUrl: string): void {
    const id = videoUrl.split('v=')[1];
    const imageUrl = `https://img.youtube.com/vi/${id}/0.jpg`;
    const thumbnail = `
      <div style='position: relative'>
        <a href='${videoUrl}' target='_blank'>
          <img src="${imageUrl}" alt="click to watch"/>
        </a>
      </div>`;
    this.insertHtml(thumbnail);
  }

  private insertVimeoVideoTag(videoUrl: string): void {
    const sub = this.http.get<any>(`https://vimeo.com/api/oembed.json?url=${videoUrl}`).subscribe(data => {
      const imageUrl = data.thumbnail_url_with_play_button;
      const thumbnail = `<div>
        <a href='${videoUrl}' target='_blank'>
          <img src="${imageUrl}" alt="${data.title}"/>
        </a>
      </div>`;
      this.insertHtml(thumbnail);
      sub.unsubscribe();
    });
  }

  nextNode(node) {
    if (node.hasChildNodes()) {
      return node.firstChild;
    } else {
      while (node && !node.nextSibling) {
        node = node.parentNode;
      }
      if (!node) {
        return null;
      }
      return node.nextSibling;
    }
  }

  getRangeSelectedNodes(range, includePartiallySelectedContainers) {
    let node = range.startContainer;
    const endNode = range.endContainer;
    let rangeNodes = [];

    // Special case for a range that is contained within a single node
    if (node === endNode) {
      rangeNodes = [node];
    } else {
      // Iterate nodes until we hit the end container
      while (node && node !== endNode) {
        rangeNodes.push(node = this.nextNode(node));
      }

      // Add partially selected nodes at the start of the range
      node = range.startContainer;
      while (node && node !== range.commonAncestorContainer) {
        rangeNodes.unshift(node);
        node = node.parentNode;
      }
    }

    // Add ancestors of the range container, if required
    if (includePartiallySelectedContainers) {
      node = range.commonAncestorContainer;
      while (node) {
        rangeNodes.push(node);
        node = node.parentNode;
      }
    }

    return rangeNodes;
  }

  getSelectedNodes() {
    const nodes = [];
    if (this.doc.getSelection) {
      const sel = this.doc.getSelection();
      for (let i = 0, len = sel.rangeCount; i < len; ++i) {
        nodes.push.apply(nodes, this.getRangeSelectedNodes(sel.getRangeAt(i), true));
      }
    }
    return nodes;
  }

  replaceWithOwnChildren(el) {
    const parent = el.parentNode;
    while (el.hasChildNodes()) {
      parent.insertBefore(el.firstChild, el);
    }
    parent.removeChild(el);
  }

  removeSelectedElements(tagNames) {
    const tagNamesArray = tagNames.toLowerCase().split(',');
    this.getSelectedNodes().forEach((node) => {
      if (node.nodeType === 1 &&
        tagNamesArray.indexOf(node.tagName.toLowerCase()) > -1) {
        // Remove the node and replace it with its children
        this.replaceWithOwnChildren(node);
      }
    });
  }
}
