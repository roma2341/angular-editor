import {
  AfterContentInit,
  Component,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AngularEditorConfig, angularEditorConfig } from './config';
import { AngularEditorToolbarComponent } from './angular-editor-toolbar.component';
import { AngularEditorService } from './angular-editor.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'angular-editor',
  templateUrl: './angular-editor.component.html',
  styleUrls: ['./angular-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AngularEditorComponent),
      multi: true
    }
  ]
})
export class AngularEditorComponent implements OnInit, ControlValueAccessor, AfterViewInit, AfterContentInit {
  private onChange: (value: string) => void;
  private onTouched: () => void;

  placeholder: boolean;

  modeVisual = true;
  showPlaceholder = false;
  @Input() id = '';
  @Input() config: AngularEditorConfig = angularEditorConfig;

  @Output() html;

  @ViewChild('editor', { static: true }) textArea: ElementRef;
  @ViewChild('editorWrapper', { static: true }) editorWrapper: ElementRef;
  @ViewChild('editorToolbar', { static: true }) editorToolbar: AngularEditorToolbarComponent;

  @Output() viewMode = new EventEmitter<boolean>();

  /** emits `blur` event when focused out from the textarea */
  @Output() blur: EventEmitter<string> = new EventEmitter<string>();

  /** emits `focus` event when focused in to the textarea */
  @Output() focus: EventEmitter<string> = new EventEmitter<string>();

  @Output() fileAdded: EventEmitter<Event> = new EventEmitter<Event>();

  constructor(public vcRef: ViewContainerRef, private _renderer: Renderer2, private editorService: AngularEditorService, @Inject(DOCUMENT) private _document: any) {

  }

  ngOnInit() {
    this.editorToolbar.id = this.id;
    this.editorToolbar.fonts = this.config.fonts ? this.config.fonts : angularEditorConfig.fonts;
    this.editorToolbar.customClasses = this.config.customClasses;
    this.editorToolbar.textArea = this.textArea;
    this.editorToolbar.uploadUrl = this.config.uploadUrl;
    this.editorToolbar.config = this.config;

    this.editorService.uploadUrl = this.config.uploadUrl;
    if (this.config.showToolbar !== undefined) {
      this.editorToolbar.showToolbar = this.config.showToolbar;
    }
    if (this.config.defaultParagraphSeparator) {
      this.editorService.setDefaultParagraphSeparator(this.config.defaultParagraphSeparator);
    }

  }

  ngAfterViewInit(): void {
    if (this.config.defaultFontName) {
      this.editorToolbar.defaultFontId = this.config.defaultFontName ? this.editorToolbar.fonts.findIndex(x => {
        return x.name === this.config.defaultFontName;
      }) : 0;
      this.editorToolbar.fontId = this.editorToolbar.defaultFontId;
      this.onEditorFocus();
      this.editorService.setFontName(this.config.defaultFontName);
    } else {
      this.editorToolbar.defaultFontId = 0;
      this.editorToolbar.fontId = 0;
    }
    if (this.config.defaultFontSize) {
      this.editorToolbar.fontSize = this.config.defaultFontSize;
      this.onEditorFocus();
      this.editorService.setFontSize(this.config.defaultFontSize);
    }
  }

  ngAfterContentInit() {

  }

  /**
   * Executed command from editor header buttons
   * @param command string from triggerCommand
   */
  executeCommand(command: string) {
    if (command === 'toggleEditorMode') {
      this.toggleEditorMode(this.modeVisual);
    } else if (command !== '') {
      this.editorService.executeCommand(command);
      this.exec();
    }

    this.onEditorFocus();
  }

  /**
   * focus event
   */
  onTextAreaFocus(): void {
    this.focus.emit('focus');
  }

  /**
   * blur event
   */
  onTextAreaBlur(event: FocusEvent) {
    /**
     * save selection if focussed out
     */
    this.editorService.saveSelection();

    if (typeof this.onTouched === 'function') {
      this.onTouched();
    }

    if (event.relatedTarget != null && (event.relatedTarget as HTMLElement).parentElement.className !== 'angular-editor-toolbar-set') {
      this.blur.emit('blur');
    }
  }

  onPast(e: ClipboardEvent) {
    if (e.clipboardData) {
      // Get the items from the clipboard
      var items = e.clipboardData.items;
      if (items) {
        // Loop through all items, looking for any kind of image
        for (var i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            // We need to represent the image as a file,
            var blob = items[i].getAsFile();
            var reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              const area = this.textArea.nativeElement as HTMLElement;
              var source = reader.result as string;
              const img = this.editorService.insertImage(this.config, false, source, this.vcRef, area);
              img.instance.resizeEnd.subscribe(() => this.onContentChange(this.textArea.nativeElement.innerHTML));
              img.instance.ready.subscribe(() => this.onContentChange(this.textArea.nativeElement.innerHTML));
            }

          }
        }

      }
    }
  }

  /**
   *  focus the text area when the editor is focussed
   */
  onEditorFocus() {
    if (this.modeVisual) {
      this.textArea.nativeElement.focus();
    } else {
      const sourceText = this._document.getElementById('sourceText');
      // sourceText.textContent = '1';
      sourceText.focus();
    }
  }

  /**
   * Executed from the contenteditable section while the input property changes
   * @param html html string from contenteditable
   */
  onContentChange(html: string): void {
    if (typeof this.onChange === 'function') {
      const regex = /<editor-img .+(<img .+>)<\/editor-img>/gm;
      this.onChange(html.replace(regex, (value, img) => {
        return img;
      }));
      if ((!html || html === '<br>' || html === '') !== this.showPlaceholder) {
        this.togglePlaceholder(this.showPlaceholder);
      }
      this.initImageResizers();
    }
  }

  /**
   * Set the function to be called
   * when the control receives a change event.
   *
   * @param fn a function
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Set the function to be called
   * when the control receives a touch event.
   *
   * @param fn a function
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Write a new value to the element.
   *
   * @param value value to be executed when there is a change in contenteditable
   */
  writeValue(value: any): void {

    if ((!value || value === '<br>' || value === '') !== this.showPlaceholder) {
      this.togglePlaceholder(this.showPlaceholder);
    }

    if (value === null || value === undefined || value === '' || value === '<br>') {
      value = null;
    }

    this.refreshView(value);
  }

  /**
   * refresh view/HTML of the editor
   *
   * @param value html string from the editor
   */
  refreshView(value: string): void {
    const normalizedValue = value === null ? '' : value;
    this._renderer.setProperty(this.textArea.nativeElement, 'innerHTML', normalizedValue);
    this.initImageResizers();
    return;
  }

  initImageResizers() {
    const area = this.textArea.nativeElement as HTMLElement;
    area.querySelectorAll('img').forEach(item => {
      if (item.parentElement.tagName != 'EDITOR-IMG') {
        const selection = window.getSelection();
        selection.removeAllRanges();
        let range = document.createRange();
        range.selectNode(item);
        selection.addRange(range);
        this.editorService
          .insertImage(this.config, true, item.getAttribute('src'), this.vcRef, area, { width: item.width, height: item.height, resizable: true })
          .instance.resizeEnd.subscribe(() => this.onContentChange(this.textArea.nativeElement.innerHTML));
      }
    })
  }

  /**
   * toggles placeholder based on input string
   *
   * @param value A HTML string from the editor
   */
  togglePlaceholder(value: boolean): void {
    if (!value) {
      this._renderer.addClass(this.editorWrapper.nativeElement, 'show-placeholder');
      this.showPlaceholder = true;

    } else {
      this._renderer.removeClass(this.editorWrapper.nativeElement, 'show-placeholder');
      this.showPlaceholder = false;
    }
  }

  /**
   * Implements disabled state for this element
   *
   * @param isDisabled
   */
  setDisabledState(isDisabled: boolean): void {
    const div = this.textArea.nativeElement;
    const action = isDisabled ? 'addClass' : 'removeClass';
    this._renderer[action](div, 'disabled');
  }

  /**
   * toggles editor mode based on bToSource bool
   *
   * @param bToSource A boolean value from the editor
   */
  toggleEditorMode(bToSource: boolean) {
    let oContent: any;
    const editableElement = this.textArea.nativeElement;

    if (bToSource) {
      oContent = this._document.createTextNode(editableElement.innerHTML);
      editableElement.innerHTML = '';

      const oPre = this._document.createElement('pre');
      oPre.setAttribute('style', 'margin: 0; outline: none;');
      const oCode = this._document.createElement('code');
      editableElement.contentEditable = false;
      oCode.id = 'sourceText';
      oCode.setAttribute('style', 'display:block; white-space: pre-wrap; word-break: keep-all; margin: 0; outline: none; background-color: #fff5b9;');
      oCode.contentEditable = 'true';
      oCode.placeholder = 'test';
      oCode.appendChild(oContent);
      oPre.appendChild(oCode);
      editableElement.appendChild(oPre);

      this._document.execCommand('defaultParagraphSeparator', false, 'div');

      this.modeVisual = false;
      this.viewMode.emit(false);
      oCode.focus();
    } else {
      if (this._document.all) {
        editableElement.innerHTML = editableElement.innerText;
      } else {
        oContent = this._document.createRange();
        oContent.selectNodeContents(editableElement.firstChild);
        editableElement.innerHTML = oContent.toString();
      }
      editableElement.contentEditable = true;
      this.modeVisual = true;
      this.viewMode.emit(true);
      this.onContentChange(editableElement.innerHTML);
      editableElement.focus();
    }
    this.editorToolbar.setEditorMode(!this.modeVisual);
  }

  /**
   * toggles editor buttons when cursor moved or positioning
   *
   * Send a node array from the contentEditable of the editor
   */
  exec() {
    this.editorToolbar.triggerButtons();

    let userSelection;
    if (window.getSelection) {
      userSelection = window.getSelection();
    }

    let a = userSelection.focusNode;
    const els = [];
    while (a && a.id !== 'editor') {
      els.unshift(a);
      a = a.parentNode;
    }
    this.editorToolbar.triggerBlocks(els);
  }

}
