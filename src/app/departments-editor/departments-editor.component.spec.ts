import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentsEditorComponent } from './departments-editor.component';

describe('DepartmentsEditorComponent', () => {
  let component: DepartmentsEditorComponent;
  let fixture: ComponentFixture<DepartmentsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentsEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
