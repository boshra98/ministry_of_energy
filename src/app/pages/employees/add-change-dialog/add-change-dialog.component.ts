// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-add-change-dialog',
//   imports: [],
//   templateUrl: './add-change-dialog.component.html',
//   styleUrl: './add-change-dialog.component.scss'
// })
// export class AddChangeDialogComponent {

// }

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, ReactiveFormsModule, Validators, AbstractControl, FormGroup
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }  from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule }   from '@angular/material/icon';

import { EMPLOYMENT_CHANGES_PORT, EmploymentChangesPort } from '../../../services/employment-changes.port';
import { EmploymentChangeType } from '../../../models/employment-change';
import { LookupService } from '../../../services/lookup.service';
// import { DEPARTMENTS, OrgNode } from '../../../models/department';
import { OrgTreeService } from '../../../services/org-tree.service';
import { OrgNode } from '../../../models/department';

import { Employee } from '../../../services/local-employees.service';
import { employeeToForm } from '../../../shared/mappers/employee.mapper';
import { deriveCurrentState } from '../../../utils/derive-current';
import { LookupOption } from '../../../models/lookup.models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-change-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    
],
  templateUrl: './add-change-dialog.component.html',
  styleUrls: ['./add-change-dialog.component.scss'],
})




export class AddChangeDialogComponent implements OnInit {
//inject
  data = inject(MAT_DIALOG_DATA) as { emp: Employee };
  ref  = inject(MatDialogRef<AddChangeDialogComponent>);
  fb   = inject(FormBuilder);
  port = inject(EMPLOYMENT_CHANGES_PORT);
  lookup = inject(LookupService);
  org = inject(OrgTreeService);


//lookup
  jobCategoryOpts: LookupOption[] = [];
  jobAttributeOpts: LookupOption[] = [];
  appointmentTypesOpts: LookupOption[] = [];
  jobTitleOpts: LookupOption[] | undefined;

  //org tree

  // orgTree: OrgNode[] = DEPARTMENTS;
  orgTree: OrgNode[] = [];
path: string[] = [];                  // المسار المختار (كود لكل مستوى)
levels: OrgNode[][] = []; 
  // خيارات مستويات السلسلة
  // level1Opts: OrgNode[] = [];
  // level2Opts: OrgNode[] = [];
  // level3Opts: OrgNode[] = [];
  // level4Opts: OrgNode[] = [];

  // مسطّح (لو أردته للبحث/العرض)
  // flatPlaces: Array<{ code: string; name: string }> = [];

  // لعرض الحالة الحالية في الـ save()
  employeeSnapshot: Employee | undefined = this.data?.emp;

  //forms
  form = this.fb.group({
    type: ['SALARY_INCREASE' as EmploymentChangeType, Validators.required],
    effectiveFrom: [null as Date | null, Validators.required],
    decisionNumber: [''],
    decisionDate: [null as Date | null],
    reason: [''],

    newJobTitle: [''],
    newJobCategory: [''],
    newJobAttribute: [''],
    newAppointmentType: [''],
    newSalary: [null as number | null],

    // مستويات المكان
    // placeL1: [null as string | null,],
    // placeL2: [null as string | null],
    // placeL3: [null as string | null],
    // placeL4: [null as string | null],

    // الكود النهائي (أعمق مستوى) — يتحدّث تلقائيًا
    newPlaceCode: [''],

    // تحديثات الحالة الحالية
    newdecisionappointment: [''],
    newdecisiondate: [null as Date | null],
  }, { validators: atLeastOneChanged });
trackByValue = (_: number, it: { value: string }) => it.value;

  get t() { return (this.form.get('type')!.value || 'OTHER') as EmploymentChangeType; }

  constructor() {
    // تحميل اللوائح
    this.lookup.jobCategories$.subscribe(o => this.jobCategoryOpts = o || []);
    this.lookup.jobAttributes$.subscribe(o => this.jobAttributeOpts = o || []);
    this.lookup.appointmentTypes$.subscribe(o => this.appointmentTypesOpts = o || []);
    this.lookup.jobTitles$.subscribe(o => this.jobTitleOpts = o || []);
    // this.flattenOrgs(this.orgTree, this.flatPlaces);
  }

//   private collectPlaceActionWork(): string[] {
//   const { placeL1, placeL2, placeL3, placeL4 } = this.form.value;
//   return [placeL1, placeL2, placeL3, placeL4].filter(Boolean) as string[];
// }

// private updateDeepestPlaceCode() {
//   const codes = this.collectPlaceActionWork();
//   const deepest = codes.length ? codes[codes.length - 1] : '';
//   this.form.patchValue({ newPlaceCode: deepest }, { emitEvent: false });
// }
  private destroy$ = new Subject<void>();
rebuildLevels() {
  this.levels = [];
  let cursor = this.orgTree;
  this.levels.push(cursor);           // المستوى 0 = الجذر
  for (let i = 0; i < this.path.length; i++) {
    const code = this.path[i];
    const node = cursor.find(n => n.code === code);
    const kids = node?.subs ?? [];
    if (!kids.length) break;
    this.levels.push(kids);           // المستوى التالي
    cursor = kids;
  }
}
// onPickLevel(i: number, code: string) {
//   this.path = [...this.path.slice(0, i), code];  // حدّث الاختيار واقطع الأعمق
//   this.rebuildLevels();                          // أعد توليد المستويات التالية
//   this.updateDeepestPlaceCode();                 // إن كنت تحفظ أعمق كود
// }
onPickLevel(i: number, code: string): void {
  // اقطع كل ما بعد المستوى i ثم أضف الاختيار الجديد
  this.path = [...this.path.slice(0, i), code];
  this.rebuildLevels();

  // إن أردت الاحتفاظ بأعمق كود في الحقل (للتوافق مع الـ save):
  const deepest = this.path.length ? this.path[this.path.length - 1] : '';
  this.form.patchValue({ newPlaceCode: deepest }, { emitEvent: false });
}
// إن أردت إرسال مصفوفة الأكواد كلها لحقل النموذج:
get placeActionWorkPath(): string[] {
  return this.path;
}

  ngOnInit() {

this.org.tree$
    .pipe(takeUntil(this.destroy$))
    .subscribe(tree => {
      this.orgTree = tree ?? [];
      // إن كان لديك مسار محفوظ من الموظف، استخدمه وإلا ابدأ بمستوى الجذر فقط
      const prev = this.normalizePathToCodes((this.data?.emp as any)?.placeActionWork);
      this.path = prev.length ? [...prev] : [];
      this.rebuildLevels();

      // حدّث أعمق كود ليتوافق مع الحفظ
      const deepest = this.path.length ? this.path[this.path.length - 1] : '';
      this.form.patchValue({ newPlaceCode: deepest }, { emitEvent: false });
    });
    // this.rebuildLevels();
  // لو عندك قيمة سابقة للمكان استرجعها:
  const prev = this.normalizePathToCodes((this.data?.emp as any)?.placeActionWork);
  if (prev.length) { this.path = [...prev]; this.rebuildLevels(); }


// ابني مصفوفة المستويات انطلاقًا من الشجرة + المسار الحالي

// ✅ استلم الشجرة الحية من خدمة الأقسام
    // this.org.tree$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(tree => {
    //     this.orgTree   = tree ?? [];
    //     this.level1Opts = this.orgTree;            // أول مستوى
    //     this.flatPlaces = [];                      // أعد البناء
    //     this.flattenOrgs(this.orgTree, this.flatPlaces);

    //     // لو فُتح الديالوج مع موظف: عبّي المستويات من مساره الحالي (إن وُجد)
    //     if (this.data?.emp) {
    //       const codes = this.normalizePathToCodes((this.data.emp as any).placeActionWork);
    //       if (codes.length) this.fillWorkplaceLevelsFromPath(codes);
    //     }
    //   });
    
    // // المستوى الأول متاح دائمًا
    // this.level1Opts = this.orgTree ?? [];

    // // ربط تغييرات المستويات (بدون workdetails)
    // this.form.get('placeL1')!.valueChanges.subscribe((code: string | null) => {
    //   const n1 = this.findNode(this.orgTree, code);
    //   this.level2Opts = n1?.subs ?? [];
    //   // مسح الأدنى
    //   this.form.patchValue({ placeL2: null, placeL3: null, placeL4: null }, { emitEvent: false });
    //   this.level3Opts = [];
    //   this.level4Opts = [];
    //   this.updateDeepestPlaceCode();
    // });

    // this.form.get('placeL2')!.valueChanges.subscribe((code: string | null) => {
    //   const n1 = this.findNode(this.orgTree, this.form.value.placeL1 || null);
    //   const n2 = this.findNode(n1?.subs ?? [], code);
    //   this.level3Opts = n2?.subs ?? [];
    //   this.form.patchValue({ placeL3: null, placeL4: null }, { emitEvent: false });
    //   this.level4Opts = [];
    //   this.updateDeepestPlaceCode();
    // });

    // this.form.get('placeL3')!.valueChanges.subscribe((code: string | null) => {
    //   const n1 = this.findNode(this.orgTree, this.form.value.placeL1 || null);
    //   const n2 = this.findNode(n1?.subs ?? [], this.form.value.placeL2 || null);
    //   const n3 = this.findNode(n2?.subs ?? [], code);
    //   this.level4Opts = n3?.subs ?? [];
    //   this.form.patchValue({ placeL4: null }, { emitEvent: false });
    //   this.updateDeepestPlaceCode();
    // });

    // this.form.get('placeL4')!.valueChanges.subscribe(() => {
    //   this.updateDeepestPlaceCode();
    // });

    // إن كانت نافذة "إضافة تغيير" تُفتح مع موظف — عبّي النموذج:
    if (this.data?.emp) {
      this.patchForm(this.data.emp);
    }

    
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

 
  /** ابحث عن عقدة بحسب الكود داخل مجموعة معيّنة (باستخدام subs) */
  private findNode(haystack: OrgNode[] | undefined, code: string | null | undefined): OrgNode | undefined {
    if (!haystack || !code) return undefined;
    for (const n of haystack) {
      if (n.code === code) return n;
      const hit = this.findNode(n.subs, code);
      if (hit) return hit;
    }
    return undefined;
  }

  /** من مصفوفة أكواد المسار (['MIN','STUD','IT', 'SEC']) عبّي المستويات */
  // private fillWorkplaceLevelsFromPath(codes: string[]) {
  //   // L1
  //   const n1 = this.findNode(this.orgTree, codes[0] ?? null);
  //   this.level1Opts = this.orgTree;
  //   this.form.patchValue({ placeL1: n1?.code ?? null }, { emitEvent: false });

  //   // L2
  //   const n2 = this.findNode(n1?.subs ?? [], codes[1] ?? null);
  //   this.level2Opts = n1?.subs ?? [];
  //   this.form.patchValue({ placeL2: n2?.code ?? null }, { emitEvent: false });

  //   // L3
  //   const n3 = this.findNode(n2?.subs ?? [], codes[2] ?? null);
  //   this.level3Opts = n2?.subs ?? [];
  //   this.form.patchValue({ placeL3: n3?.code ?? null }, { emitEvent: false });

  //   // L4
  //   const n4 = this.findNode(n3?.subs ?? [], codes[3] ?? null);
  //   this.level4Opts = n3?.subs ?? [];
  //   this.form.patchValue({ placeL4: n4?.code ?? null }, { emitEvent: false });

  //   // حدّث أعمق كود
  //   this.updateDeepestPlaceCode();
  // }

  /** حوّل أي تمثيل لمسار العمل إلى مصفوفة أكواد */
  private normalizePathToCodes(placeActionWork: string | string[] | null | undefined): string[] {
    if (!placeActionWork) return [];
    if (Array.isArray(placeActionWork)) return placeActionWork.filter(Boolean);
    // String مثل "MIN/STUD/IT" أو "MIN>STUD>IT" أو "MIN.STUD.IT"
    const sep = placeActionWork.includes('/') ? '/' :
                placeActionWork.includes('>') ? '>' : '.';
    return placeActionWork.split(sep).map(s => s.trim()).filter(Boolean);
  }

  /** عبّي النموذج من الموظف */
  patchForm(emp: Employee): void {
    // Patch only the relevant fields for this dialog's form
    this.form.patchValue({
      type: 'SALARY_INCREASE',
      effectiveFrom: null,
      decisionNumber: emp.currentDecisionAppointment ?? '',
      decisionDate: emp.datecurrentDecisionAppointment ?? null,
      reason: '',
      newJobTitle: '',
      newJobCategory: '',
      newJobAttribute: '',
      newAppointmentType: '',
      newSalary: null,
      newPlaceCode: '',
      newdecisionappointment: '',
      newdecisiondate: null,
      // Optionally patch placeL1-L4 if you want to initialize them
      // placeL1: null, placeL2: null, placeL3: null, placeL4: null
    }, { emitEvent: false });

    // إذا كانت لديك قيمة placeActionWork في الـ Employee — فكّكها للمستويات
    // const codes = this.normalizePathToCodes((emp as any).placeActionWork);
    // if (codes.length) {
    //   this.fillWorkplaceLevelsFromPath(codes);
    // } else {
    //   // لا يوجد مسار محفوظ — اترك المستويات فارغة (L1 required)
    //   this.level1Opts = this.orgTree ?? [];
    // }
  }

 

  
async save() {
  if (this.form.invalid) { this.form.markAllAsTouched(); return; }

  const empId = String(this.data?.emp?.id || '').trim();
  if (!empId) { console.error('[AddChangeDialog] missing employee id'); return; }

  const v = this.form.getRawValue();

  // نبني الـ payload بما يلزم فقط
  const payload: any = {
    employeeId: empId,
    type: (v.type ?? 'OTHER') as EmploymentChangeType,
    effectiveFrom: v.effectiveFrom ?? undefined,
    decisionNumber: (v.decisionNumber || '').trim() || undefined,
    decisionDate: v.decisionDate ?? undefined,
    reason: (v.reason || '').trim() || undefined,

    newJobTitle: (v.newJobTitle || '').trim() || undefined,
    newJobCategory: (v.newJobCategory || '').trim() || undefined,
    newJobAttribute: (v.newJobAttribute || '').trim() || undefined,
    newAppointmentType: (v.newAppointmentType || '').trim() || undefined,
    newSalary: v.newSalary ?? undefined,

    newdecisionappointment: (v.newdecisionappointment || '').trim() || undefined,
    newdecisiondate: v.newdecisiondate ?? undefined,
  };

  // ✅ أرسل المكان فقط في حالة INTERNAL_MOVE
  if (v.type === 'INTERNAL_MOVE') {
    const deepest = this.path.length ? this.path[this.path.length - 1] : undefined;
    payload.placeActionWork = this.path.length ? [...this.path] : undefined; // مصفوفة الأكواد كاملة
    payload.newPlaceCode    = deepest;
  }

  try {
    await this.port.create(payload);

    // ✅ أعِد Snapshot محدث للأب
    const changes = await this.port.list(empId);
    // ملاحظة: لو عندك employeeInitial في الأب، إرسال this.data.emp هنا كقاعدة أولى مناسب
    const snapshot = deriveCurrentState(this.data.emp, changes);

    this.ref.close({ ok: true, snapshot });  // ← سيقوم الأب بتحديث البطاقة فورًا
  } catch (e) {
    console.error('[AddChangeDialog] create failed', e);
  }


 
}
  cancel() {
     this.ref.close(false);
   }
  // private flattenOrgs(nodes: OrgNode[], acc: Array<{ code: string; name: string }>) {
  //   for (const n of nodes) {
  //     if (n.code) acc.push({ code: n.code, name: n.name });
  //     if (n.subs?.length) this.flattenOrgs(n.subs, acc);
  //   }
  // }
  

  



}




export function atLeastOneChanged(group: AbstractControl) {
  const g = group as FormGroup;
  const keys = [
    'newJobTitle','newJobCategory','newJobAttribute',
    'newAppointmentType','newSalary','newPlaceCode',
    'newdecisionappointment','newdecisiondate',
  ];

  const hasAny = keys.some(k => {
    const v = g.get(k)?.value;
    return v !== null && v !== undefined && v !== '';
  });

  return hasAny ? null : { nothingChanged: true };
}
