// src/app/pages/employees/edit-employee/edit-employee.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, NonNullableFormBuilder } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';

import {
  LocalEmployeesService,
  Employee,
  EmployeeUpdate,
  NewEmployee,
} from '../../../services/local-employees.service';

import { DEPARTMENTS } from '../../../models/department';
import { LookupService } from '../../../services/lookup.service';
import { NationalityService } from '../../../services/nationality.services';
import { AddNationalityDialogComponent } from '../add-employee/add-nationality-dialog.component';

import { OTHER_VALUE } from '../../../shared/constants';
import {
  createEmployeeForm,
  EmployeeForm,
} from '../../../shared/types/employee-form.type';

import {
  employeeToForm,
  formToNewEmployee,
  fillWorkplaceLevelsFromPath,
} from '../../../shared/mappers/employee.mapper';

@Component({
  standalone: true,
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss'],
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatStepperModule,
    MatChipsModule,
  ],
})
export class EditEmployeeComponent implements OnInit, OnDestroy {
  // — الخدمات —
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(LocalEmployeesService);
  private snack = inject(MatSnackBar);
  private fb = inject(NonNullableFormBuilder);
  private dialog = inject(MatDialog);
  private nat = inject(NationalityService);
  private lookup = inject(LookupService);

  // — الحالة —
  editingId: string | null = null;
  loading = true;
  notFound = false;

  // — الفورم الموحّد (نفس حقول الإضافة) —
  form: EmployeeForm = createEmployeeForm(this.fb);

  // — القوائم —
  nationalities: string[] = [];
  OTHER_VALUE = OTHER_VALUE;
  today = () => new Date();

  // — شجرة الأقسام (لوائح متسلسلة) —
  departments = DEPARTMENTS;
  get workdetails() { return this.form.get('workdetails') as FormGroup; }
  get level1Code(): string | null { return this.workdetails.get('level1Code')?.value ?? null; }
  get level2Code(): string | null { return this.workdetails.get('level2Code')?.value ?? null; }
  get level3Code(): string | null { return this.workdetails.get('level3Code')?.value ?? null; }

  get level2List() {
    const n1 = this.departments.find(d => d.code === this.level1Code);
    return n1?.subs ?? [];
  }
  get level3List() {
    const n2 = this.level2List.find(d => d.code === this.level2Code);
    return n2?.subs ?? [];
  }
  get level4List() {
    const n3 = this.level3List.find(d => d.code === this.level3Code);
    return n3?.subs ?? [];
  }

  // — Getters شائعة الاستخدام في القالب (اختياري) —
  get basic() { return this.form.get('basic') as FormGroup; }
  get details() { return this.form.get('details') as FormGroup; }
  get personals() { return this.form.get('personals') as FormGroup; }
  get communication() { return this.form.get('communication') as FormGroup; }

  get birthDateCtrl() { return this.basic.get('birthDate') as FormControl<Date | null>; }
  get workDateCtrl() { return this.workdetails.get('workDate') as FormControl<Date | null>; }
  get dateActionWorkCtrl() { return this.workdetails.get('dateActionWork') as FormControl<Date | null>; }
  get dateQualificationCtrl() { return this.details.get('dateQualification') as FormControl<Date | null>; }
  get nationalityCtrl() { return this.basic.get('nationality') as FormControl<string[]>; }
  get jobAttributeCtrl() { 
  return this.workdetails.get('jobAttribute') as FormControl<string>;
}
get jobCategoryCtrl() { 
  return this.workdetails.get('jobCategory') as FormControl<string>;
}
get decisionAttributeCtrl(){
  return this.workdetails.get('decisionAttribute') as FormControl<string>;
}
get appointmentTypeCtrl(){
  return this.workdetails.get('appointmentType') as FormControl<string>;
}
  // — دفق القوائم من LookupService (لو تستخدمها في القالب) —
  get genders$()            { return this.lookup.genders$; }
  get bloodTypes$()         { return this.lookup.bloodTypes$; }
  get maritalStatus$()      { return this.lookup.maritalStatus$; }
  get emergencyRelations$() { return this.lookup.emergencyRelations$; }
  get jobTitles$()          { return this.lookup.jobTitles$; }
  get educations$()         { return this.lookup.educations$; }
  get jobAttributes$() { return this.lookup.JOBATTRIBUTE_DEFAULTES$; }
  get jobCategories$(){return this.lookup.JOBCATEGORY_DEFAULTES$;}
 get decisionAttribute$(){return this.lookup.decisionAttribute_DEFAULTES$;}
 get appointmentTypes$(){return this.lookup.appointmentTypes_DEFAULTES$;}
// Getter لكنترول النموذج (موجود عندك)


// trackBy
trackByValue = (_: number, it: { value: string }) => it.value;

  


  ngOnInit(): void {
    // جلب الجنسيات وترتيبها
    this.nat.nationalities$.subscribe(list => {
      this.nationalities = [...list].sort((a, b) => a.localeCompare(b, 'ar'));
    });

    // تنظيف المستويات عند تغيّر الأعلى
    this.workdetails.get('level1Code')?.valueChanges.subscribe(() => {
      this.workdetails.patchValue({ level2Code: '', level3Code: '', level4Code: '' }, { emitEvent: false });
    });
    this.workdetails.get('level2Code')?.valueChanges.subscribe(() => {
      this.workdetails.patchValue({ level3Code: '', level4Code: '' }, { emitEvent: false });
    });
    this.workdetails.get('level3Code')?.valueChanges.subscribe(() => {
      this.workdetails.patchValue({ level4Code: '' }, { emitEvent: false });
    });

    // قراءة :id وتعبئة النموذج
    this.route.paramMap.subscribe(pm => {
      this.loading = true;
      const id = pm.get('id');
      this.editingId = id ?? null;

      if (!this.editingId) {
        this.notFound = true;
        this.loading = false;
        return;
      }

      const emp = this.findEmployee(this.editingId);
      if (!emp) {
        this.notFound = true;
        this.loading = false;
        return;
      }

      this.patchForm(emp);
      this.loading = false;
    });
    //ليطبع سبب فشل اختيار من القائمة--طلعت المشكلة بتعريف النمط داخل الفاليديتور
    this.appointmentTypeCtrl.valueChanges.subscribe(v => {
  console.log('value =', v);
  console.log('valid =', this.appointmentTypeCtrl.valid);
  console.log('errors =', this.appointmentTypeCtrl.errors);
});

  }

  ngOnDestroy(): void {
    // لا شيء حرج هنا؛ كل الاشتراكات على Controls تعيش بعمر الكومبوننت
  }

  private findEmployee(id: string): Employee | undefined {
    return this.store.list().find(e => e.id === id);
  } 
  //
  private patchForm(emp: Employee): void {
    // يملأ كل الحقول (Date|null وغيرها) من الموديل
    employeeToForm(emp, this.form);

    // يملأ مستويات الشجرة من placeActionWork المخزنة
    fillWorkplaceLevelsFromPath(this.form, emp.placeActionWork);

    // نظافة
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  // دعم “غير ذلك…” في الجنسيات (اختياري)
  async onAddOtherNationality(): Promise<void> {
    const ref = this.dialog.open(AddNationalityDialogComponent, {
      width: '420px',
      data: { existing: this.nationalities.filter(n => n !== OTHER_VALUE) },
    });
    const addedRaw = await ref.afterClosed().toPromise();
    const added = (addedRaw ?? '').trim();
    if (!added) return;

    // أضف للقائمة الدائمة
    this.nat.addNationality(added);

    // حدّث قيمة الكنترول
    const now = this.nationalityCtrl.value ?? [];
    const exists = now.some(v => v?.toLowerCase() === added.toLowerCase());
    if (!exists) this.nationalityCtrl.setValue([...now, added]);
  }

  // حفظ
  save(): void {
    if (this.form.invalid || !this.editingId) {
      this.form.markAllAsTouched();
      return;
    }

    // خذ كل القيم بنسق NewEmployee (المابر يبني placeActionWork وينظّف الجنسيات)
    const payload: NewEmployee = formToNewEmployee(this.form);

    const updated = this.store.update({ id: this.editingId, ...payload } as EmployeeUpdate);
    if (updated) {
      this.snack.open('تم تحديث بيانات الموظف بنجاح ✅', 'إغلاق', { duration: 2500 });
      this.router.navigate(['/employees']);
    } else {
      this.snack.open('تعذّر التحديث: الموظف غير موجود', 'إغلاق', { duration: 2500 });
    }
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
