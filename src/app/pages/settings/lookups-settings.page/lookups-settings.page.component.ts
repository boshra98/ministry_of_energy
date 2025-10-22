// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-lookups-settings.page',
//   imports: [],
//   templateUrl: './lookups-settings.page.component.html',
//   styleUrl: './lookups-settings.page.component.scss'
// })
// export class LookupsSettingsPageComponent {

// }


// pages/settings/lookups-settings.page.ts




/////////////

// pages/settings/lookups-settings.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';

// هذان يجب أن يكونا standalone أيضًا
import { DepartmentsEditorComponent } from '../../../departments-editor/departments-editor.component';
import { LookupEditorComponent } from '../../../lookup-editor/lookup-editor.component';

@Component({
  selector: 'app-lookups-settings',
  standalone: true,
  template: `
    <mat-tab-group mat-stretch-tabs dynamicHeight >
      <mat-tab label="الجنسيات">
        <app-lookup-editor [key]="'NATIONALITIES'"></app-lookup-editor>
      </mat-tab>

      <mat-tab label="مكان مباشرة العمل (الأقسام)">
        <app-departments-editor></app-departments-editor>
      </mat-tab>

      <mat-tab label="الحالة الاجتماعية">
        <app-lookup-editor [key]="'MARITAL_STATUS'"></app-lookup-editor>
      </mat-tab>

  

      <mat-tab label="المسمى الوظيفية">
        <app-lookup-editor [key]="'JOB_TITLES' "></app-lookup-editor>

      </mat-tab>
      <mat-tab label="النوع (الجنس)">
        <app-lookup-editor [key]="'GENDERS'"></app-lookup-editor>
      </mat-tab>

      <mat-tab label="فصائل الدم">
        <app-lookup-editor [key]="'BLOOD_TYPES'"></app-lookup-editor>
      </mat-tab>

      <mat-tab label="العلاقات الطارئة">
        <app-lookup-editor [key]="'EMERGENCY_RELATIONS'"></app-lookup-editor>
      </mat-tab>
      <mat-tab label="المستويات التعليمية">
        <app-lookup-editor [key]="'EDUCATIONS'"></app-lookup-editor>
      </mat-tab>
      <mat-tab label="صفات الوظيفة ">
        <app-lookup-editor [key]="'JOB_ATTRIBUTE'"></app-lookup-editor>
      </mat-tab>
      <mat-tab label="فئات الوظيفة">
        <app-lookup-editor [key]="'JOB_CATEGORY'"></app-lookup-editor>
      </mat-tab>
      <mat-tab label="صفات القرارات">
        <app-lookup-editor [key]="'DECISION_ATTRIBUTE'"></app-lookup-editor>
      </mat-tab>
      <mat-tab label="أنواع التعيينات">
        <app-lookup-editor [key]="'APPOINTMENT_TYPES'"></app-lookup-editor>
      </mat-tab>

      <!-- أضف بقية القوائم بنفس الأسلوب -->
    </mat-tab-group>
  `,
  imports: [
    CommonModule,
    MatTabsModule,
    DepartmentsEditorComponent,
    LookupEditorComponent,
  ],
})
export class LookupsSettingsPage {}

