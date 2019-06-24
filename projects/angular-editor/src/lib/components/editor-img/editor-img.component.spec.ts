/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EditorResizableImgComponent } from './editor-img.component';

describe('EditorImgComponent', () => {
  let component: EditorResizableImgComponent;
  let fixture: ComponentFixture<EditorResizableImgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorResizableImgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorResizableImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
