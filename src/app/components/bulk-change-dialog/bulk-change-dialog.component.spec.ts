import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkChangeDialogComponent } from './bulk-change-dialog.component';

describe('BulkChangeDialogComponent', () => {
  let component: BulkChangeDialogComponent;
  let fixture: ComponentFixture<BulkChangeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkChangeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkChangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
