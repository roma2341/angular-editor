import { NgModule, Injector } from '@angular/core';
import { AngularEditorComponent } from './angular-editor.component';
import { AngularEditorToolbarComponent } from './angular-editor-toolbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AngularEditorService } from './angular-editor.service';
import { ResizableModule } from 'angular-resizable-element';
import { EditorResizableImgComponent } from './components/editor-img/editor-img.component';
import { createCustomElement } from '@angular/elements';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ResizableModule 
  ],
  declarations: [
    AngularEditorComponent,
    AngularEditorToolbarComponent,
    EditorResizableImgComponent
  ],
  entryComponents: [
    EditorResizableImgComponent
  ],
  providers: [
    AngularEditorService
  ],
  exports: [AngularEditorComponent, AngularEditorToolbarComponent]
})
export class AngularEditorModule {
  constructor(private injector: Injector) {
   /* const customButton = createCustomElement(EditorImgComponent, { injector });
    customElements.define('editor-img', customButton);*/
  }
}
