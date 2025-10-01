import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmploymentChangeTabComponent } from './employment-change-tab.component';

describe('EmploymentChangeTabComponent', () => {
  let component: EmploymentChangeTabComponent;
  let fixture: ComponentFixture<EmploymentChangeTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmploymentChangeTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmploymentChangeTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
