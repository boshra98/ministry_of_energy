import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseEmployeeComponent } from './browse-employee.component';

describe('BrowseEmployeeComponent', () => {
  let component: BrowseEmployeeComponent;
  let fixture: ComponentFixture<BrowseEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
