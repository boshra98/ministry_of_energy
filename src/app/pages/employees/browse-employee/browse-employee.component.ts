// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-browse-employee',
//   imports: [],
//   templateUrl: './browse-employee.component.html',
//   styleUrl: './browse-employee.component.scss'
// })
// export class BrowseEmployeeComponent {

// }


// import { Component, Input, computed, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormGroup } from '@angular/forms';
// import { MatCardModule } from '@angular/material/card';
// import { MatIconModule } from '@angular/material/icon';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatButtonModule } from '@angular/material/button';

// @Component({
//   selector: 'app-browse-employee',
//   standalone: true,
//   imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule, MatChipsModule, MatButtonModule],
//   templateUrl: './browse-employee.component.html',
//   styleUrls: ['./browse-employee.component.scss']
// })
// export class BrowseEmployeeComponent {
//   @Input({ required: true }) form!: FormGroup;
//   @Input() photoUrl?: string;  // اختيارية (صورة الموظف)
//   @Input() qrText?: string;    // اختيارية (نص QR لو بدك تولد كود)
// window: any;

//   // مساعد لقراءة أي قيمة من الـ FormGroup بمسار "group.control"
//   fv(path: string): string {
//     const ctrl = this.form?.get(path);
//     const v = (ctrl?.value ?? '').toString().trim();
//     return v || '—';
//   }

//   fullName = computed(() => {
//     const first = this.fv('basic.firstName');
//     const father = this.fv('basic.fatherName');
//     const last = this.fv('basic.lastName');
//     const parts = [first, father, last].filter(x => x && x !== '—');
//     return parts.length ? parts.join(' ') : '—';
//   });

//   // مثال لتنسيق تاريخ (لو التواريخ نص ISO)
//   formatDate(v: string) {
//     if (!v || v === '—') return '—';
//     try {
//       const d = new Date(v);
//       if (isNaN(d.getTime())) return v;
//       return d.toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' });
//     } catch {
//       return v;
//     }
//   }
// }



// import { Component, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatCardModule } from '@angular/material/card';
// import { MatIconModule } from '@angular/material/icon';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatButtonModule } from '@angular/material/button';
// import { ActivatedRoute, Router } from '@angular/router';
// import { LocalEmployeesService, Employee } from '../../../services/local-employees.service';
// import { OrgNamePipe } from '../../../pipes/org-name.pipe';
// import { DEPARTMENTS  } from '../../../models/department';
// import { OTHER_VALUE } from '../../../shared/constants';
// import { LookupService } from '../../../../../src/app/services/lookup.service';
// import { LookupOption } from '../../../../../src/app/shared/lookups/lookups.types';
// // import { OTHER_VALUE } from '../../../shared/constants';
// interface OrgNode { code: string; name: string; subs?: OrgNode[]; }

// @Component({
//   selector: 'app-browse-employee',
//   standalone: true,
//   imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule, MatChipsModule, MatButtonModule,OrgNamePipe],
//   templateUrl: './browse-employee.component.html',
//   styleUrls: ['./browse-employee.component.scss']
// })
// export class BrowseEmployeeComponent {
// goHome() {
// throw new Error('Method not implemented.');
// }
//   OTHER_VALUE = OTHER_VALUE;


// orgTree: OrgNode[] = DEPARTMENTS;
// orgOpts = { tree: this.orgTree, mode: 'path' as const, sep: ' | ' };



//   private route = inject(ActivatedRoute);
//   private router = inject(Router);
//   private store  = inject(LocalEmployeesService);
// window: any;

//   employee?: Employee;
//   loading = true;
//   notFound = false;

//   photoUrl?: string; // لو عندك صور
//   qrText?: string;   // لو بدك QR

//   ngOnInit() {
//     const id = this.route.snapshot.paramMap.get('id');
//     if (!id) { this.notFound = true; this.loading = false; return; }

//     const list = this.store.list();
//     this.employee = list.find(e => e.id === id);
//     this.notFound = !this.employee;
//     this.loading = false;
//     console.log('placeActionWork =', this.placeActionWork);
//     console.log('orgTree length =', this.orgTree?.length);

//   console.log('employee.nationality =', this.employee?.nationality);
//   console.log('employee.otherNationality =', (this.employee as any)?.otherNationality);
//   console.log('basic.otherNationality =', (this.employee as any)?.basic?.otherNationality);

//   // اطبع القيمة النظيفة (التي كتبها المستخدم)
//   const otherNat = this.getOtherNationality(this.employee);
//   console.log('otherNationality (clean) =', otherNat ?? '∅'); // ∅ يعني مافي قيمة
// }


// private getOtherNationality(e: any): string | null {
//   if (!e) return null;
//   const direct = (e.otherNationality ?? e.basic?.otherNationality ?? '').trim();
//   if (direct) return direct;

//   const nat = e.nationality ?? e.basic?.nationality;
//   if (Array.isArray(nat) && nat.includes(OTHER_VALUE)) {
//     return null; // اختير "غير ذلك" بدون نص
//   }
//   return null;
// }

// get nationalityListClean(): string[] {
//   const e: any = this.employee ?? null;
//   if (!e) return [];

//   const raw = e.nationality ?? e.basic?.nationality ?? [];
//   let list: string[] = Array.isArray(raw)
//     ? raw
//     : (typeof raw === 'string' ? raw.split(/[,\u060C]/) : []);

//   list = list
//     .map(v => (typeof v === 'string' ? v.trim() : ''))
//     .filter(v => v && v !== OTHER_VALUE && v !== 'غير ذلك');

//   const other = this.getOtherNationality(e);
//   if (other && !list.includes(other)) list.push(other);

//   return list;
// }

// /** نص جاهز للعرض بفاصلة عربية */
// get nationalityDisplay(): string {
//   const list = this.nationalityListClean;
//   return list.length ? list.join('، ') : '—';
// }

  
//   formatDate(v?: string | Date | null): string {
//   if (!v) return '—';

//   const d = v instanceof Date ? v : new Date(v);
//   if (isNaN(d.getTime())) return String(v);

//   const day   = d.getDate().toString().padStart(2, '0');       // يوم برقمين
//   const month = (d.getMonth() + 1).toString().padStart(2, '0'); // شهر برقمين
//   const year  = d.getFullYear();

//   return `${day}/${month}/${year}`;
// }

// today = () => new Date();

// back() {
//   this.router.navigate(['/search']); // أو المسار المناسب عندك
// }
// get placeActionWork(): string {
//   return this.employee?.placeActionWork
//     ?? (this.employee as any)?.workdetails?.placeActionWork
//     ?? '—';
// }


// }


import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

import { LocalEmployeesService, Employee } from '../../../services/local-employees.service';
import { DEPARTMENTS, OrgNode } from '../../../models/department';
import { OTHER_VALUE } from '../../../shared/constants';
import { LookupService } from '../../../services/lookup.service';
import { LookupOption } from '../../../shared/lookups/lookups.types';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { OrgNamePipe } from '../../../pipes/org-name.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTab } from '@angular/material/tabs';
import { EmploymentChangeTabComponent } from "../employment-change-tab/employment-change-tab.component";
import { EMPLOYMENT_CHANGES_PORT } from '../../../services/employment-changes.port';
import { deriveCurrentState } from '../../../utils/derive-current';
import { EmployeeDocumentsComponent } from "../employee-documents/employee-documents.component";


type AttachmentView = {
  id: string;
  name: string;
  mime: string;          // 'image/jpeg' | 'image/png' | 'application/pdf'
  size: number;
  dataUrl: string;       // base64 data URL
  uploadedAt: string;    // ISO datetime
};

interface QualificationView {
  paperFileNumber: string;
  collage: string;
  education: string;          // label جاهز للعرض
  sourceAcadimicQualification: string;
  dateQualification: string;  // نص منسّق
  detailsQualification: string;
  attachment: AttachmentView | null;   // ✅ مهم
}

@Component({
  standalone: true,
  selector: 'app-browse-employee',
 imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule, MatChipsModule, MatButtonModule, OrgNamePipe, MatTabsModule, MatTab, EmploymentChangeTabComponent, EmployeeDocumentsComponent],

  templateUrl: './browse-employee.component.html',
  styleUrls: ['./browse-employee.component.scss'],
})
export class BrowseEmployeeComponent implements OnInit, OnDestroy {
Array: any;


  edit(emp: Employee) {
    this.router.navigate(['/employees/edit', emp.id]);
  }

  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private store  = inject(LocalEmployeesService);
  private lookup = inject(LookupService);
  private port   = inject(EMPLOYMENT_CHANGES_PORT);          // ✅ منفذ سجلّ التبدلات

  private destroy$ = new Subject<void>();

  OTHER_VALUE = OTHER_VALUE;

  orgTree: OrgNode[] = DEPARTMENTS;
  orgOpts = { tree: this.orgTree, mode: 'path' as const, sep: ' | ' };

  employee?: Employee;                // أساس (كما هو مخزّن)
  employeeInitial?: Employee;         // ✅ أول تعيين (نسخة مجمّدة)
  employeeSnapshot?: Employee;        // ✅ الحالة الحالية المشتقّة من التبدلات

  loading = true;
  notFound = false;
  photoUrl?: string;



  

  // خرائط لتحويل الأكواد إلى تسميات
  genderMap   = new Map<string, string>();
  maritalMap  = new Map<string, string>();
  jobTitleMap = new Map<string, string>();
  emergencyContentRelationMap = new Map<string,string>();
  jobAttributeMap = new Map<string, string>();
  jobCategoryMap = new Map<string, string>();
  decisionAttributeMap = new Map<string, string>();
  appointmentTypesMap = new Map<string, string>();
  educationMap = new Map<string, string>();

  window: any;

  ngOnInit(): void {
    this.init(); // نفّذ التهيئة غير المتزامنة
    // ابنِ الخرائط من الـ LookupService
    this.lookup.genders$
      .pipe(takeUntil(this.destroy$))
      .subscribe((opts: LookupOption[]) => this.genderMap = new Map(opts.map(o => [o.value, o.label])));
    this.lookup.maritalStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((opts: LookupOption[]) => this.maritalMap = new Map(opts.map(o => [o.value, o.label])));
    this.lookup.jobTitles$
      .pipe(takeUntil(this.destroy$))
      .subscribe((opts: LookupOption[]) => this.jobTitleMap = new Map(opts.map(o => [o.value, o.label])));
    this.lookup.JOBATTRIBUTE_DEFAULTES$
      .pipe(takeUntil(this.destroy$))
      .subscribe((opts: LookupOption[]) => this.jobAttributeMap = new Map(opts.map(o => [o.value, o.label])));
    this.lookup.JOBCATEGORY_DEFAULTES$
      .pipe(takeUntil(this.destroy$))
      .subscribe((opts: LookupOption[]) => this.jobCategoryMap = new Map(opts.map(o => [o.value, o.label])));
    this.lookup.emergencyRelations$
      .pipe(takeUntil(this.destroy$))
      .subscribe((opts: LookupOption[]) => this.emergencyContentRelationMap = new Map(opts.map(o => [o.value, o.label])));
    this.lookup.decisionAttribute_DEFAULTES$
      .pipe(takeUntil(this.destroy$))
      .subscribe((opts: LookupOption[]) => this.decisionAttributeMap = new Map(opts.map(o => [o.value, o.label])));
    this.lookup.appointmentTypes_DEFAULTES$
      .pipe(takeUntil(this.destroy$))
      .subscribe((opts: LookupOption[]) => this.appointmentTypesMap = new Map(opts.map(o => [o.value, o.label])));
    this.lookup.educations$
      .pipe(takeUntil(this.destroy$))
      .subscribe((opts: LookupOption[]) => this.educationMap = new Map(opts.map(o => [o.value, o.label])));
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


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // —— تنقّل —— //
  goHome() { this.router.navigate(['']); }
  back()   { this.router.navigate(['/search']); }

  // ===== أدوات مصادر العرض =====
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
  private get E0(): any   { return this.employeeInitial; }                             // أول تعيين
  private get Ecur(): any { return this.employeeSnapshot ?? this.employeeInitial; }
  
  
  private pickPlaceInitial(src: any): string | string[] | undefined {
  return src?.placeActionWork
      ?? src?.workdetails?.placeActionWork
      ?? src?.currentJoblocation
      ?? undefined;
}
  
  // الحالي

  private pickJobAttribute(src: any): string | undefined {
  return src?.currentJobAttribute
      ?? src?.jobAttribute
      ?? src?.workdetails?.jobAttribute
      ?? undefined;
}

private pickAppointmentTypeInitial(src: any): string | undefined {
  return src?.appointmentType
      ?? src?.appointemntType        // تهجئة قديمة
      ?? src?.workdetails?.appointmentType
      ?? src?.currentappointmentType // أخيراً فقط
      ?? src?.currentAppointmentType
      ?? undefined;
}


private pickPlaceCurrent(src: any): string | string[] | undefined {
  return src?.currentJoblocation
      ?? src?.placeActionWork
      ?? src?.workdetails?.placeActionWork
      ?? undefined;
}
private pickAppointmentTypeCurrent(src: any): string | undefined {
  return src?.currentappointmentType
      ?? src?.currentAppointmentType
      ?? src?.appointmentType
      ?? src?.appointemntType
      ?? src?.workdetails?.appointmentType
      ?? undefined;
}
private pickJobCategory(src: any): string | undefined {
  return src?.currentJobCategory
      ?? src?.jobCategory
      ?? src?.workdetails?.jobCategory
      ?? undefined;
}
private pickAppointmentType(src: any): string | undefined {
  // لديك currentappointmentType بحرف a صغيرة بعد current
  return src?.currentappointmentType
      ?? src?.currentAppointmentType
      ?? src?.appointmentType
      ?? src?.appointemntType
      ?? src?.workdetails?.appointmentType
      ?? undefined;
}
private pickJobTitle(src: any): string | undefined {
  return src?.currentJobTitle
      ?? src?.jobTitle
      ?? src?.workdetails?.jobTitle
      ?? undefined;
}
private pickSalary(src: any): string | undefined {
  return src?.currentSalary
      ?? src?.salary
      ?? src?.workdetails?.salary
      ?? undefined;
}
private pickDecisionText(src: any): string | undefined {
  return src?.currentDecisionAppointment
      ?? src?.decisionAppointment
      ?? src?.workdetails?.decisionAppointment
      ?? undefined;
}
private pickDecisionDate(src: any): Date | string | undefined {
  return src?.datecurrentDecisionAppointment
      ?? src?.decisionDate
      ?? src?.workdetails?.decisionDate
      ?? undefined;
}
private pickPlace(src: any): string | undefined {
  return src?.currentJoblocation          // 👈 اجعل الحالي أولاً
      ?? src?.placeActionWork
      ?? src?.workdetails?.placeActionWork
      ?? undefined;
}
private pickEducation(src: any): string | undefined {
  return src?.education ?? src?.details?.education ?? undefined;
}
private pickEmergencyRelation(src: any): string | undefined {
  return src?.emergencyContentRelation ?? src?.communication?.EMERGENCY_RELATIONS ?? undefined;
}

  // ===== قيم “الحالي” (للتوافق مع القالب القديم) =====
  // private get jobAttributeValue(): string | undefined { return this.pickJobAttribute(this.Ecur); }

private get jobAttributeValue(): string | undefined { return this.pickJobAttribute(this.Ecur); }
private get jobCategoryValue():  string | undefined { return this.pickJobCategory(this.Ecur); }
private get appointmentTypeValue(): string | undefined { return this.pickAppointmentType(this.Ecur); }
private get educationValue(): string | undefined { return this.pickEducation(this.Ecur); }
private get decisionAttributeValue(): string | undefined { return this.Ecur?.decisionAttribute ?? this.Ecur?.workdetails?.decisionAttribute ?? undefined; }



/** تحويل تاريخ ISO أو Date إلى نص قصير */
private fmt(v?: string | Date | null): string {
  if (!v) return '—';
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? '—'
    : `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

/** جِب قائمة الشهادات مع تحويل الأكواد إلى لابلات + تاريخ منسّق.
 * يدعم البيانات القديمة (حقل واحد مسطّح) كعنصر واحد.
 */


get qualificationsView(): QualificationView[] {
  const e: any = this.employeeSnapshot ?? this.employeeInitial ?? this.employee;
  if (!e) return [];

  const list = e.details?.qualifications as any[] | undefined;

  if (Array.isArray(list) && list.length) {
    return list.map((q: any) => ({
      paperFileNumber: q.paperFileNumber || '—',
      collage: q.collage || '—',
      education: this.educationMap.get(q.education) ?? q.education ?? '—',
      sourceAcadimicQualification: q.sourceAcadimicQualification || '—',
      dateQualification: this.fmt(q.dateQualification ?? null),
      detailsQualification: q.detailsQualification || '—',
      attachment: q.attachment ?? null,                     // ✅ موجود هنا
    }));
  }

  // توافق خلفي (حقول قديمة مفردة) ← أعِد عنصرًا واحدًا + attachment=null
  const legacyHas =
    e.education || e.collage || e.paperFileNumber ||
    e.sourceAcadimicQualification || e.dateQualification || e.detailsQualification;

  return legacyHas ? [{
    paperFileNumber: e.paperFileNumber || '—',
    collage: e.collage || '—',
    education: this.educationMap.get(e.education) ?? e.education ?? '—',
    sourceAcadimicQualification: e.sourceAcadimicQualification || '—',
    dateQualification: this.fmt(e.dateQualification ?? null),
    detailsQualification: e.detailsQualification || '—',
    attachment: null,                                        // ✅ مهم جدًا
  }] : [];
}





/** حوّل string[] إلى string (join) وأزل '—' */
private normalizePlaceForPipe(
  v: string | string[] | null | undefined
): string | null {
  if (!v) return null;
  // لو عندك احتمال أن getter يرجّع '—' حرفيًا:
  if (v === '—') return null as any;

  return Array.isArray(v)
    ? v.filter(Boolean).join('/')    // أو أي فاصل تُفضّله
    : v;
}

get place_initial_view(): string | null {
  // place_initial: string | string[]
  const v = this.place_initial as any;
  return this.normalizePlaceForPipe(v);
}

get place_current_view(): string | null {
  // place_current: string | string[]
  const v = this.place_current as any;
  return this.normalizePlaceForPipe(v);
}

  // ===== لابلات “الحالي” (قديمة) =====

private asLabel(v?: string | null, map?: Map<string, string>): string {
  if (!v) return '—';
  return map?.get(v) ?? v;
}
private asDateLabel(v?: string | Date | null): string {
  return this.formatDate(v ?? null);
}

// لابلات "الحالي" (للتوافق مع كود قديم في القالب)
get jobAttributeLabel(): string {
  return this.asLabel(this.jobAttributeValue, this.jobAttributeMap);
}
get jobCategoryLabel(): string {
  return this.asLabel(this.jobCategoryValue, this.jobCategoryMap);
}
get EMERGENCYLabel(): string {
  const v = this.pickEmergencyRelation(this.employee);
  return this.asLabel(v, this.emergencyContentRelationMap);
}
get decisionAttributeLabel(): string {
  return this.asLabel(this.decisionAttributeValue, this.decisionAttributeMap);
}
get appointmentTypeLabel_current(): string {
  const v = this.pickAppointmentTypeCurrent(this.Ecur);
  return this.asLabel(v, this.appointmentTypesMap);
}
get place_current(): string | string[] {
  return this.pickPlaceCurrent(this.Ecur) ?? '—';
}
get educationLabel(): string {
  return this.asLabel(this.educationValue, this.educationMap);
}

// لابلات "أول تعيين" (Initial)
get jobAttributeLabel_initial(): string {
  const v = this.pickJobAttribute(this.E0);
  return this.asLabel(v, this.jobAttributeMap);
}
get jobCategoryLabel_initial(): string {
  const v = this.pickJobCategory(this.E0);
  return this.asLabel(v, this.jobCategoryMap);
}
get appointmentTypeLabel_initial(): string {
  const v = this.pickAppointmentTypeInitial(this.E0);
  return this.asLabel(v, this.appointmentTypesMap);
}
get jobTitleLabel_initial(): string {
  const v = this.pickJobTitle(this.E0);
  return this.asLabel(v, this.jobTitleMap);
}
get salary_initial(): string {
  return this.pickSalary(this.E0) ?? '—';
}
get decision_initial(): string {
  return this.pickDecisionText(this.E0) ?? '—';
}
get decisionDate_initial(): string {
  return this.asDateLabel(this.pickDecisionDate(this.E0));
}
get place_initial(): string | string[] {
  return this.pickPlaceInitial(this.E0) ?? '—';
}

// لابلات "الحالي" (Current)
get jobAttributeLabel_current(): string {
  const v = this.pickJobAttribute(this.Ecur);
  return this.asLabel(v, this.jobAttributeMap);
}
get jobCategoryLabel_current(): string {
  const v = this.pickJobCategory(this.Ecur);
  return this.asLabel(v, this.jobCategoryMap);
}
get jobTitleLabel_current(): string {
  const v = this.pickJobTitle(this.Ecur);
  return this.asLabel(v, this.jobTitleMap);
}
get salary_current(): string {
  return this.pickSalary(this.Ecur) ?? '—';
}
get decision_current(): string {
  return this.pickDecisionText(this.Ecur) ?? '—';
}
get decisionDate_current(): string {
  return this.asDateLabel(this.pickDecisionDate(this.Ecur));
}

 

  // —— عرض الجنسيات —— //
  private getOtherNationality(e: any): string | null {
    if (!e) return null;
    const direct = (e.otherNationality ?? e.basic?.otherNationality ?? '').trim();
    if (direct) return direct;
    const nat = e.nationality ?? e.basic?.nationality;
    if (Array.isArray(nat) && nat.includes(OTHER_VALUE)) return null;
    return null;
  }
  get nationalityListClean(): string[] {
    const e: any = this.employee ?? null;
    if (!e) return [];
    const raw = e.nationality ?? e.basic?.nationality ?? [];
    let list: string[] = Array.isArray(raw) ? raw : (typeof raw === 'string' ? raw.split(/[,\u060C]/) : []);
    list = list.map(v => (typeof v === 'string' ? v.trim() : ''))
               .filter(v => v && v !== OTHER_VALUE && v !== 'غير ذلك');
    const other = this.getOtherNationality(e);
    if (other && !list.includes(other)) list.push(other);
    return list;
  }
  get nationalityDisplay(): string {
    const list = this.nationalityListClean;
    return list.length ? list.join('، ') : '—';
  }

  // —— تحويل كود ← لابل —— //
  labelOf(map: Map<string, string>, code?: string | null): string {
    if (!code) return '—';
    return map.get(code) ?? '—';
  }

  // حقول شخصية (لا تتبدّل غالبًا بالتبدلات)
  get genderLabel(): string {
    return this.labelOf(this.genderMap, this.employee?.gender);
  }
  get maritalStatusLabel(): string {
    return this.labelOf(this.maritalMap, this.employee?.materialStatus);
  }
//   get jobTitleLabel(): string {
//     // للتوافق القديم: اعرض الحالي
//     const v = this.pickJobTitle(this.Ecur); if (!v) return '—';
//     return this.jobTitleMap.get(v) ?? v;
// }  
get jobTitleLabel(): string {
  const e: any = this.employeeSnapshot ?? this.employee;
  const code = e?.currentJobTitle         // ✅ الحالي
            ?? e?.jobTitle                // أول/قديم
            ?? e?.workdetails?.jobTitle
            ?? null;
  if (!code) return '—';
  return this.jobTitleMap.get(code) ?? code;
}
  // من تبويب التبدلات: يُحدّث اللقطة الحالية فقط
  onSnapshotChange(emp: Employee) {
    this.employeeSnapshot = this.deepClone(emp);
    console.log('SNAP', emp);
  }

  // —— تنسيق تواريخ —— //
  formatDate(v?: string | Date | null): string {
    if (!v) return '—';
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d.getTime())) return String(v);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  today = () => new Date();

  // // —— مسار مكان المباشرة —— //
  // get placeActionWork(): string {
  //   const snap = this.pickPlace(this.Ecur);
  //   const base = this.pickPlace(this.employee);
  //   return snap ?? base ?? '—';
  // }


  get placeActionWork(): string {
  const e: any = this.employeeSnapshot ?? this.employee;
  const code =
      e?.currentJoblocation              // ✅ الحالي من التبدّلات
   ?? e?.placeActionWork                 // أول/قديم
   ?? e?.workdetails?.placeActionWork
   ?? null;

  return code
    ? this.orgOpts.tree /* pipe بالـ template */ && code
    : '—';
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






