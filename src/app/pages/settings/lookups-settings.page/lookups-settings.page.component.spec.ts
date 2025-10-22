import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsSettingsPage } from './lookups-settings.page.component';

describe('LookupsSettingsPageComponent', () => {
  let component: LookupsSettingsPage;
  let fixture: ComponentFixture<LookupsSettingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsSettingsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
