import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceTreeDialogComponent } from './place-tree-dialog.component';

describe('PlaceTreeDialogComponent', () => {
  let component: PlaceTreeDialogComponent;
  let fixture: ComponentFixture<PlaceTreeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceTreeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaceTreeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
