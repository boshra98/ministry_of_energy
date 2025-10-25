// src/app/pages/employees/edit-employee/edit-employee.component.ts
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, NonNullableFormBuilder ,FormArray } from '@angular/forms';
 import { firstValueFrom, Subject, takeUntil } from 'rxjs';

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
  DocAttachmentType,
} from '../../../services/local-employees.service';

// import { DEPARTMENTS } from '../../../models/department';
import { LookupService } from '../../../services/lookup.service';
import { AddNationalityDialogComponent } from '../add-employee/add-nationality-dialog.component';

import { OTHER_VALUE } from '../../../shared/constants';
import {
  createEmployeeForm,
  EmployeeForm,
  createQualificationGroup
} from '../../../shared/types/employee-form.type';

import {
  employeeToForm,
  formToNewEmployee,
  fillWorkplaceLevelsFromPath,
} from '../../../shared/mappers/employee.mapper';
import { EmployeeDocumentsComponent } from "../employee-documents/employee-documents.component";
import { EmploymentChangeTabComponent } from "../employment-change-tab/employment-change-tab.component";
import { EMPLOYMENT_CHANGES_PORT } from '../../../services/employment-changes.port';

import { deriveCurrentState } from '../../../utils/derive-current';
import { OrgTreeService } from '../../../services/org-tree.service';
import { OrgNode } from '../../../pipes/org-name.pipe';





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
    EmployeeDocumentsComponent,
    EmploymentChangeTabComponent
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
  private lookup = inject(LookupService);
  private port   = inject(EMPLOYMENT_CHANGES_PORT);  
      private cdr: ChangeDetectorRef | undefined ;
        // منفذ سجلّ التبدلات

  // — الحالة —
  editingId: string | null = null;
  loading = true;
  notFound = false;

  // — الفورم الموحّد (نفس حقول الإضافة) —
  form: EmployeeForm = createEmployeeForm(this.fb);

  // — القوائم —
  // nationalities: string[] = [];
  // بدلاً من string[] + اشتراك يدوي
nationalities$ = this.lookup.nationalities$;

  OTHER_VALUE = OTHER_VALUE;
  today = () => new Date();

private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }


  

  employeeSnapshot?: Employee;        // ✅ الحالة الحالية المشتقّة من التبدلات

    employee?: Employee;                // أساس (كما هو مخزّن)
  employeeInitial?: Employee;         // ✅ أول تعيين (نسخة مجمّدة)


  // — شجرة الأقسام (لوائح متسلسلة) —
  // departments = DEPARTMENTS;
private org = inject(OrgTreeService);
departments: OrgNode[] = [];
orgTree: OrgNode[] = [];          // إن كنت تمُرِّرها للبايب/القالب
private destroy$ = new Subject<void>(); 

  get nationalityDisplay(): string {
  const list = this.nationalityCtrl.value ?? [];
  return list.length ? list.join('، ') : 'اختر جنسية واحدة أو أكثر';
}

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
  // get dateQualificationCtrl() { return this.details.get('dateQualification') as FormControl<Date | null>; }
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
 get jobAttributes$()     { return this.lookup.jobAttributes$; }
get jobCategories$()     { return this.lookup.jobCategories$; }
get decisionAttribute$() { return this.lookup.decisionAttributes$; }
get appointmentTypes$()  { return this.lookup.appointmentTypes$; }
// Getter لكنترول النموذج (موجود عندك)


// لم 
get qualifications(): FormArray {
  return this.form.get(['details', 'qualifications']) as FormArray; // ✅ صح
}

addQualification(): void {
  this.qualifications.push(createQualificationGroup());
}
removeQualification(i: number): void {
  if (this.qualifications.length > 1) this.qualifications.removeAt(i);
}
duplicateQualification(i: number): void {
  const v = this.qualifications.at(i).value;
  const g = createQualificationGroup();
  g.patchValue(v);
  this.qualifications.push(g);
}


// trackBy
trackByValue = (_: number, it: { value: string }) => it.value;

  


  ngOnInit(): void {
        this.init(); // نفّذ التهيئة غير المتزامنة


this.org.tree$
    .pipe(takeUntil(this.destroy$))
    .subscribe(tree => {
      this.departments = tree ?? [];
      this.orgTree = tree ?? [];
      this.cdr?.markForCheck(); // لو OnPush
    });

    // جلب الجنسيات وترتيبها
   

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
    }
  );
    //ليطبع سبب فشل اختيار من القائمة--طلعت المشكلة بتعريف النمط داخل الفاليديتور
    this.appointmentTypeCtrl.valueChanges.subscribe(v => {
  console.log('value =', v);
  console.log('valid =', this.appointmentTypeCtrl.valid);
  console.log('errors =', this.appointmentTypeCtrl.errors);
}
);

  }

  ngOnDestroy(): void {
    // لا شيء حرج هنا؛ كل الاشتراكات على Controls تعيش بعمر الكومبوننت
  }

  private async init() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.notFound = true; this.loading = false; return; }
  
    // 1) جِب الموظف الأساس
    const list = this.store.list();
    this.employee = list.find(e => e.id === id) ?? undefined;
    this.notFound = !this.employee;
    if (!this.employee) { this.loading = false; return; }
  
    // 2) ثبّت "أول تعيين" بنسخة مجمّدة (بدون التكرار)
    this.employeeInitial = this.deepClone(this.employee); // ← احتفِظ بواحدة
    Object.freeze(this.employeeInitial);                  // تجميد لمنع أي تعديل بالخطأ
  
    // 3) اشتقّ الحالة الحالية من سجلّ التبدلات فقط
    try {
      const changes = await this.port.list(id);
      this.employeeSnapshot = deriveCurrentState(this.employeeInitial, changes);
    } catch (err) {
      console.error('[BrowseEmployee.init] failed to load changes', err);
      this.employeeSnapshot = this.employeeInitial; // fallback إلى الأول
    } finally {
      this.loading = false;
    }
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
  // افتح الديالوج (لا حاجة لتمرير existing؛ التكرار يُمنع داخل الريجستري)
  const ref = this.dialog.open(AddNationalityDialogComponent, {
    width: '420px',
    data: { existing: [] },
  });

  const addedRaw = await firstValueFrom(ref.afterClosed());
  const added = (addedRaw ?? '').trim();
  if (!added) return;

  // 1) أضِف للجداول المرجعية المركزية (LookupRegistry)
  //    add يُرجع null إذا كانت القيمة مكررة أو غير صالحة حسب منطقك
  const created = await this.lookup.add('NATIONALITIES', { value: added, label: added });

  if (!created) {
    // تكرار أو إدخال غير صالح
    this.snack.open('الجنسية موجودة مسبقًا أو غير صالحة', 'إغلاق', { duration: 2000 });
    return;
  }

  // 2) حدّث قيمة الكنترول مباشرة (النموذج يحفظ مصفوفة سلاسل)
  const ctrl = this.nationalityCtrl;
  const now  = ctrl.value ?? [];
  if (!now.some(v => v?.toLowerCase() === added.toLowerCase())) {
    ctrl.setValue([...now, added]);
  }

  this.snack.open('تمت إضافة الجنسية', 'إغلاق', { duration: 2000 });
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

   onSnapshotChange(emp: Employee) {
    this.employeeSnapshot = this.deepClone(emp);
    console.log('SNAP', emp);
  }


// في Add/Edit component
fileInputs: HTMLInputElement[] = []; // اربطها عبر ViewChildren لو رغبت، أو استخدم template refs في *ngFor


async onAttachFileSelected(index: number, ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowed.includes(file.type)) {
    this.snack.open('❌ الصيغة غير مدعومة. استخدم PDF أو صورة.', 'إغلاق', { duration: 2500 });
    input.value = '';
    return;
  }

  const max = 2 * 1024 * 1024; // 2 MB
  if (file.size > max) {
    this.snack.open('❌ حجم الملف كبير (الحد الأقصى 2MB).', 'إغلاق', { duration: 2500 });
    input.value = '';
    return;
  }

  // ✅ تم قبول الملف (نصل لهذه النقطة فقط إن كان نوعه وحجمه صالحين)
  const dataUrl = await fileToDataUrl(file);

  const att = {
    id: crypto.randomUUID?.() ?? `att_${Date.now()}`,
    name: file.name,
    mime: file.type,
    size: file.size,
    dataUrl,
    uploadedAt: new Date().toISOString(),
  };

  const q = this.qualifications.at(index) as FormGroup;
  q.get('attachment')?.setValue(att);
  q.markAsDirty();

  // 🎉 إشعار نجاح
  this.snack.open(`✅ تم تحميل ${file.type.startsWith('image/') ? 'الصورة' : 'ملف PDF'} بنجاح!`, 'إغلاق', { duration: 2500 });

  input.value = '';
}


openAttachment(att: { dataUrl: string; mime: string; name?: string }) {
  try {
    const blob = dataUrlToBlob(att.dataUrl, att.mime || 'application/pdf');
    const url = URL.createObjectURL(blob);
    // افتح في تبويب جديد بدون إمكانية الوصول للنافذة الأم (لأمان أعلى)
    window.open(url, '_blank', 'noopener,noreferrer');
    // يمكن تحرير الـ URL لاحقًا:
    // setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (e) {
    console.error('openAttachment failed', e);
  }



}



clearAttachment(index: number) {
  const q = (this.qualifications.at(index) as FormGroup);
  q.get('attachment')?.setValue(null);
  q.markAsDirty();
}








}

// حوّل Data URL إلى Blob
function dataUrlToBlob(dataUrl: string, fallbackMime = 'application/octet-stream'): Blob {
  const [header, base64] = dataUrl.split(',');
  const match = /data:(.*?);base64/.exec(header || '');
  const mime = match?.[1] || fallbackMime;
  const binStr = atob(base64 || '');
  const len = binStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// افتح المرفق في تبويب جديد بأمان











// helper
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}




