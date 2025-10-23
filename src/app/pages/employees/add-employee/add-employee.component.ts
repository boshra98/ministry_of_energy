// import { JOBCATEGORY_DEFAULT } from './../../../shared/lookups/lookups.constants';
import { MatCardModule } from '@angular/material/card';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, NonNullableFormBuilder , FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDatepickerModule, MatDatepickerActions } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
// import { AbstractControl, ValidationErrors } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddNationalityDialogComponent } from './add-nationality-dialog.component';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


import {
  LocalEmployeesService,
  NewEmployee,
  EmployeeUpdate,
  Employee
} from '../../../services/local-employees.service';
import { DEPARTMENTS } from '../../../models/department';

import { OTHER_VALUE } from '../../../shared/constants';
import { firstValueFrom, Subscription } from 'rxjs';


import { startWith, distinctUntilChanged, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import { MatChipSet, MatChipsModule } from "@angular/material/chips";
import { MatDialog } from '@angular/material/dialog';
import { NationalityService } from '../../../services/nationality.services';
import { LookupService } from '../../../services/lookup.service';
// import {
//   GENDERS, BLOOD_TYPES, MARITAL_STATUS, EMERGENCY_RELATIONS
// } from '../../../../../src/app/shared/lookups/lookups.constants';
import { createEmployeeForm, EmployeeForm  , createQualificationGroup} from '../../../shared/types/employee-form.type';
import { employeeToForm, fillWorkplaceLevelsFromPath, formToNewEmployee } from '../../../shared/mappers/employee.mapper';
import { EmployeeDocumentsComponent } from '../employee-documents/employee-documents.component';

export interface ParsedPlace {
  codes?: string[];
  /** الأسماء على الترتيب (مقابل الشجرة) */
  names?: string[];
  /** آخر عقدة (اسم/كود) مريحة للاستخدام السريع */
  lastCode?: string;
  lastName?: string;
  /** العمق الفعلي الذي تم التحقق منه بنجاح */
  depth?: number;
}

interface OrgNode { code: string; name: string; subs?: OrgNode[]; }


// type ParsedPlace = { main?: string; sub?: string };




@Component({
  standalone: true,
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerActions,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatStepperModule,
    MatChipsModule ,
    MatSnackBarModule
],
})
export class AddEmployeeComponent {
    private fb = inject(NonNullableFormBuilder);
      form: EmployeeForm = createEmployeeForm(this.fb);



    nationalities: string[] = [];
         private sub?: Subscription;
  

  OTHER_VALUE = OTHER_VALUE;

// new: Date|null;
goHome() {
    this.router.navigate(['']);
}
  today = () => new Date();




  // إذا وُجدت قيمة هنا فالمكوّن في وضع التعديل
  editingId: string | null = null;


departments: OrgNode[] = DEPARTMENTS; 


private findByCode(list: OrgNode[], code?: string | null): OrgNode | null {
  if (!code) return null;
  return list.find(n => n.code === code) ?? null;
};


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: LocalEmployeesService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef ,
    private nat: NationalityService ,
    private lookup: LookupService
  )
   {
    // قراءة :id إن وُجد لتفعيل وضع التعديل
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (!id) return;
      this.editingId = id;
      const emp = this.findEmployee(id);
      if (emp) this.patchForm(emp);
    });
    


  } 


get genders$()              { return this.lookup.genders$; }
get bloodTypes$()           { return this.lookup.bloodTypes$; }
get maritalStatus$()        { return this.lookup.maritalStatus$; }
get emergencyRelations$()   { return this.lookup.emergencyRelations$; }
get jobTitles$()            { return this.lookup.jobTitles$; }
get educations$()           { return this.lookup.educations$; }
get jobAttributes$() { return this.lookup.JOBATTRIBUTE_DEFAULTES$; }
get jobCategories$(){ return this.lookup.JOBCATEGORY_DEFAULTES$;}
get decisionAttribute$(){return this.lookup.decisionAttribute_DEFAULTES$}
get appointmentTypes$(){return this.lookup.appointmentTypes_DEFAULTES$;}

 get qualifications() {
  return this.details.get('qualifications') as FormArray;
}

onWorkPick(e: any) {
  console.log('picker ->', e.value, e.value instanceof Date);
  console.log('control ->', this.workDateCtrl.value);
  console.log('control ->', this.dateActionWorkCtrl.value);


}

private destroy$ = new Subject<void>();



get level1Code(): string | null {
  return this.workdetails.get('level1Code')?.value ?? null;
}
get level2Code(): string | null {
  return this.workdetails.get('level2Code')?.value ?? null;
}
get level3Code(): string | null {
  return this.workdetails.get('level3Code')?.value ?? null;
}

// اللوائح المتسلسلة
get level2List(): OrgNode[] {
  const n1 = this.findByCode(this.departments, this.level1Code);
  return n1?.subs ?? [];
}

get level3List(): OrgNode[] {
  const n2 = this.findByCode(this.level2List, this.level2Code);
  return n2?.subs ?? [];
}

get level4List(): OrgNode[] {
  const n3 = this.findByCode(this.level3List, this.level3Code);
  return n3?.subs ?? [];
}

trackByValue = (_: number, it: { value: string }) => it.value;


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
trackByIndex = (i: number) => i;



ngOnInit(): void {

  //بتجلب القائمة من السيرفس وبترتبهم بالعربي
  this.sub = this.nat.nationalities$.subscribe(list => {
    this.nationalities = [...list].sort((a, b) => a.localeCompare(b, 'ar'));
      });


  this.workdetails.get('level1Code')?.valueChanges.subscribe(() => {
    this.workdetails.patchValue({ level2Code: '', level3Code: '', level4Code: '' }, { emitEvent: false });
  });
  this.workdetails.get('level2Code')?.valueChanges.subscribe(() => {
    this.workdetails.patchValue({ level3Code: '', level4Code: '' }, { emitEvent: false });
  });
  this.workdetails.get('level3Code')?.valueChanges.subscribe(() => {
    this.workdetails.patchValue({ level4Code: '' }, { emitEvent: false });
  });

    // this.refreshNationalities();

}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
  this.sub?.unsubscribe();

}

// لفتح محور الحوار
 private openAddNationalityDialog(): Promise<string | undefined> {
  const ref = this.dialog.open(AddNationalityDialogComponent, {
    width: '420px',
    data: { existing: this.nationalities.filter(n => n !== OTHER_VALUE) }
  });
  return firstValueFrom(ref.afterClosed());
}


// مجموعات
get basic()   { return this.form.get('basic')   as FormGroup; }
get details() { return this.form.get('details') as FormGroup; }

get personals(){return this.form.get('personals') as FormGroup;}
get communication(){return this.form.get('communication') as FormGroup;}
get workdetails(){return this.form.get('workdetails')as FormGroup;}
// get currentworkdetails(){return this .form.get('currentworkdetails')as FormGroup;}

// الحقول داخل basic
get firstNameCtrl()  { return this.basic.get('firstName')  as FormControl<string>; }
get lastNameCtrl()   { return this.basic.get('lastName')   as FormControl<string>; }
get fatherNameCtrl() { return this.basic.get('fatherName') as FormControl<string>; }
get motherNameCtrl(){ return this.basic.get('motherName') as FormControl<string>;}
get genderCtrl()     { return this.basic.get('gender')     as FormControl<string>; }
get birthDateCtrl()       { return this.basic.get('birthDate')        as FormControl<Date | null>; }
// get nationalityCtrl(){ return this.basic.get('nationality')  as FormControl<string>; }
get nationalityCtrl(){ return this.basic.get('nationality') as FormControl<string[]>; } // ✅

get materialStatusCtrl(){ return this.basic.get('materialStatus')  as FormControl<string>; }
get dependencesCtrl(){  return this.basic.get('dependences')  as FormControl<string>; }
// الحقول داخل details


///// حقول داخل ال workdetails
get jobTitleCtrl()   { return this.workdetails.get('jobTitle')   as FormControl<string>; }

get decisionStartCtrl()       { return this.workdetails.get('decisionStart')       as FormControl<string>; }
// get workDateCtrl()       { return this.workdetails.get('workDate')       as FormControl<Date | null>; }
get workDateCtrl()        { return this.workdetails.get('workDate')   as FormControl<Date | null>; }

get placeActionWorkCtrl()       { return this.workdetails.get('placeActionWork')       as FormControl<string>; }
// get mainDeptCodeCtrl() { return this.workdetails.get('mainDeptCode') as FormControl<string>; }
// get subDeptCodeCtrl()  { return this.workdetails.get('subDeptCode')  as FormControl<string>; }

// get dateActionWorkCtrl()       { return this.workdetails.get('dateActionWork')       as FormControl<Date | null>; }
get dateActionWorkCtrl()  { return this.workdetails.get('dateActionWork') as FormControl<Date | null>; }

get appointmentTypeCtrl()       { return this.workdetails.get('appointmentType')       as FormControl<string>; }
get jobCategoryCtrl()       { return this.workdetails.get('jobCategory')       as FormControl<string>; }
get decisionAttributeCtrl()       { return this.workdetails.get('decisionAttribute')       as FormControl<string>; }

get jobAttributeCtrl()       { return this.workdetails.get('jobAttribute')       as FormControl<string>; }
get startingSalaryCtrl()       { return this.workdetails.get('startingSalary')       as FormControl<string>; }
get notesCtrl()       { return this.workdetails.get('notes')       as FormControl<string>; }


//////personals
get placeBirthCtrl()       { return this.personals.get('placeBirth')       as FormControl<string>; }
get centralSecretaionCtrl()       { return this.personals.get('centralSecretaion')       as FormControl<string>; }
get familyRegistrationCtrl()       { return this.personals.get('familyRegistration')       as FormControl<string>; }
get nationalNumberCtrl()       { return this.personals.get('nationalNumber')       as FormControl<string>; }
get idNumberCtrl()       { return this.personals.get('idNumber')       as FormControl<string>; }
get bloodTypeCtrl()       { return this.personals.get('bloodType')       as FormControl<string>; }

////communications
get permenentAddressCtrl()       { return this.communication.get('permenentAddress')       as FormControl<string>; }
get residenceCtrl()       { return this.communication.get('residence')       as FormControl<string>; }
get phoneNumberCtrl()       { return this.communication.get('phoneNumber')       as FormControl<string>; }
get whatsappNumberCtrl()       { return this.communication.get('whatsappNumber')       as FormControl<string>; }
get emailCtrl()       { return this.communication.get('email')       as FormControl<string>; }
get emergencyNameCtrl()   { return this.communication.get('emergencyName')       as FormControl<string>; } // الاسم للطوارئ
get emergencyContentRelationCtrl(){ return this.communication.get('emergencyContentRelation')as FormControl<string>;} //صلة القرابة
get emergencyPhone1Ctrl(){return this.communication.get('emergencyPhone1') as FormControl<string>; }
get emergencyPhone2Ctrl(){   return this.communication.get('emergencyPhone2') as FormControl<string>; } 
get nationalityDisplay(): string {
  const ctrl = this.basic.get('nationality') as FormControl<string[]>;
  const list = ctrl?.value ?? [];
  const cleaned = list.filter(v => v !== OTHER_VALUE); // شِل "غير ذلك" المؤقتة
  return cleaned.length > 0 ? cleaned.join('، ') : 'اختر جنسية واحدة أو أكثر';
}

  // —— وظائف مساعدة ——
  private findEmployee(id: string): Employee | undefined {
    return this.store.list().find(e => e.id === id);
  }


private patchForm(emp: Employee): void {
  // يملأ كل الحقول من الموديل (بما فيها التواريخ كـ Date|null)
  employeeToForm(emp, this.form);

  // يملأ مستويات المكان من المسار المخزّن بدون إطلاق valueChanges
  fillWorkplaceLevelsFromPath(this.form, emp.placeActionWork);

  // نظافة حالة النموذج
  this.form.markAsPristine();
  this.form.markAsUntouched();
  this.form.updateValueAndValidity({ emitEvent: false });
}




private parsePlaceActionWork(value: string | null | undefined): ParsedPlace {
  if (!value) return {};

  // حوّل القيمة لمسار أكواد: يفصل بـ | أو / أو >
  const codes = String(value)
    .split(/[|/>]/)
    .map(s => s.trim())
    .filter(Boolean);

  if (!codes.length) return {};

  // طابق المسار على الشجرة، واحصل على ما تم التحقق منه فعليًا
  const { names, matchedCodes } = matchPathOnTree(codes, DEPARTMENTS);

  if (!matchedCodes.length) {
    // لم يطابق أي مستوى: نرجّع المسار كما هو كأكواد فقط (للخلفية/التصحيح)
    return { codes, names: [], lastCode: codes.at(-1), depth: 0 };
  }

  return {
    codes: matchedCodes,
    names,
    lastCode: matchedCodes.at(-1),
    lastName: names.at(-1),
    depth: matchedCodes.length,
  };
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



onAddOtherClick(e: MouseEvent) {
  e.stopPropagation(); // يمنع إغلاق القائمة فورًا إن رغبت
  // this.openAddNationalityDialog().then(added => {
  //   if (!added) return;
  this.openAddNationalityDialog().then(addedRaw => {
    const added = (addedRaw ?? '').trim();
    if (!added) return;


        this.nat.addNationality(added);

    const ctrl = this.basic.get('nationality') as FormControl<string[]>;
    const now = ctrl.value ?? [];
    
    const exists = now.some(v => v?.toLowerCase() === added.toLowerCase());

    if (!exists) {
      ctrl.setValue([...now, added]); // يحددها مباشرة
    }
  });
}
submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const payload: NewEmployee = formToNewEmployee(this.form);

  if (this.editingId) {
    this.store.update({ id: this.editingId, ...payload });
    this.router.navigate(['/employees', this.editingId, 'documents']);
  } else {
    const saved = this.store.add(payload);
    this.editingId = saved.id;
    this.router.navigate(['/employees', saved.id, 'documents']);
  }
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


clearAttachment(index: number) {
  const q = (this.qualifications.at(index) as FormGroup);
  q.get('attachment')?.setValue(null);
  q.markAsDirty();
}





}

// helper
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}








// ابحث عن عقدة حسب الكود ضمن قائمة عقد.


function findByCode(list: OrgNode[], code?: string): OrgNode | null {
  if (!code) return null;
  return list.find(n => n.code === code) ?? null;
}

function buildWorkplacePath(...levels: (string | null | undefined)[]): string | null {
  const arr = levels.map(v => (v ?? '').trim()).filter(Boolean);
  return arr.length ? arr.join('|') : null;
}


// تابع يختبر مسار الأكواد على الشجرة ويُرجع أسماء مطابقة لما تم التحقق منه فعليًا.
function matchPathOnTree(codes: string[], tree: OrgNode[]): { names: string[]; matchedCodes: string[] } {
  const names: string[] = [];
  const matchedCodes: string[] = [];
  let current: OrgNode[] = tree;

  for (const code of codes) {
    const hit = findByCode(current, code);
    if (!hit) break;
    names.push(hit.name);
    matchedCodes.push(hit.code);
    current = hit.subs ?? [];
  }
  return { names, matchedCodes };
}

function normalizeNationalities(nats: unknown, other: unknown): string[] {
  const list = Array.isArray(nats)
    ? (nats as string[])
    : (typeof nats === 'string' ? nats.split(/[,\u060C]/) : []);
  const cleaned = list
    .map(v => (typeof v === 'string' ? v.trim() : ''))
    .filter(v => v && v !== OTHER_VALUE && v !== 'غير ذلك');
  const otherClean = (typeof other === 'string' ? other.trim() : '');
  if (otherClean && !cleaned.includes(otherClean)) cleaned.push(otherClean);
  return cleaned;
}







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
