import {NgModule, Injector} from '@angular/core';
import {AngularEditorComponent} from './angular-editor.component';
import {AngularEditorToolbarComponent} from './angular-editor-toolbar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import { AeSelectComponent } from './ae-select/ae-select.component';
import { ResizableModule } from 'angular-resizable-element';
import { EditorResizableImgComponent } from './components/editor-img/editor-img.component';
import { AngularEditorService } from './angular-editor.service';


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
    AeSelectComponent,
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
  }
}
