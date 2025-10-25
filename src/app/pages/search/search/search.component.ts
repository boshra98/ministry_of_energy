import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelect } from '@angular/material/select';

import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionSelectionChange } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { Subscription, Subject, takeUntil, map, distinctUntilChanged } from 'rxjs';

import { LocalEmployeesService, Employee } from '../../../services/local-employees.service';
// import { DEPARTMENTS, OrgNode } from '../../../models/department';
import { OrgNamePipe, OrgNode } from '../../../pipes/org-name.pipe';
import { LookupService } from '../../../services/lookup.service';
import { EMPLOYMENT_CHANGES_PORT } from '../../../services/employment-changes.port';
import { deriveCurrentState } from '../../../utils/derive-current';
import { MatDivider } from "@angular/material/divider";
import { MatMenu, MatMenuModule } from "@angular/material/menu";
import { LookupOption } from '../../../models/lookup.models';
import { OrgTreeService } from '../../../services/org-tree.service';
import { MatDialog } from '@angular/material/dialog';
import { PlaceTreeDialogComponent } from '../../../components/place-tree-dialog/place-tree-dialog.component';
type SearchMode = 'base' | 'current';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    // UI
    MatCardModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule,
    MatSelectModule, ReactiveFormsModule, MatChipsModule,MatMenuModule,
  MatDividerModule,MatSelect,
    MatDatepickerModule, MatNativeDateModule, MatButtonToggleModule,MatMenuModule,
    // Pipes
    OrgNamePipe,
    MatDivider,
    MatMenu
],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  // ===== عام =====
  private destroy$ = new Subject<void>();
private port = inject(EMPLOYMENT_CHANGES_PORT);

  mode: SearchMode = 'base';
  private readonly MODE_KEY = 'emp_search_mode_v1';

  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  // private nationalityService = inject(NationalityService);
  private store = inject(LocalEmployeesService);
  private router = inject(Router);
  private lookup = inject(LookupService);
  private route = inject(ActivatedRoute);
private org = inject(OrgTreeService);
private dialog = inject(MatDialog);


  private readonly STORAGE_KEY = 'emp_search_filters_v1';
  private readonly TABLE_STATE_KEY = 'emp_search_table_v1';
  ALL = '__ALL__';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // orgTree: OrgNode[] = DEPARTMENTS;
  orgTree: OrgNode[] = [];
  

  dataSource = new MatTableDataSource<Employee>([]);
  nationalities: string[] = [];
  private sub?: Subscription;

  // لوائح
  genders$ = this.lookup.genders$;
  gendersOpts: LookupOption[] = [];
  jobTitleOpts: LookupOption[] = [];
  jobAttributeOpts: LookupOption[] = [];
  jobCategoryOpts: LookupOption[] = [];
  appointmentTypesOpts: LookupOption[] = [];
  decisionAttributeOpts: LookupOption[] = [];
  educationOpts: LookupOption[] = [];
  bloodTypeOpts: LookupOption[] = [];

  // قيم نصية للـ OPTIONS
  private jobTitleValues: string[] = [];
  private jobAttributeValues: string[] = [];
  private jobCategoryValues: string[] = [];
  private appointmentTypeValues: string[] = [];
  private decisionAttributeValues: string[] = [];
  private educationValues: string[] = [];
  private bloodTypeValues: string[] = [];

  private OPTIONS: Record<string, string[]> = {
    jobTitle: this.jobTitleValues,
    jobAttribute: this.jobAttributeValues,
    jobCategory: this.jobCategoryValues,
    appointmentType: this.appointmentTypeValues,
    decisionAttribute: this.decisionAttributeValues,
    education: this.educationValues,
    bloodType: this.bloodTypeValues,
    // nationality: this.nationalities,
      nationalities: this.nationalities,   //  (بدلاً من nationality)

    placeCode: [], // سنملؤها من flatPlaces
  };

  // نموذج الفلاتر
  showFilters = true;
  filtersForm!: FormGroup;

  // الأعمدة الديناميكية
  columnPicker = new FormControl<ColId[]>([]);
  allColumns: ColumnDef[] = [
    { id: 'index',        label: '#',                   selectable: false, always: true },
    { id: 'fullName',     label: 'الاسم الكامل',        selectable: true,  always: true },

    // أعمدة موحّدة تتبدّل قيمها بحسب mode
    { id: 'jobTitle',     label: 'المسمى الوظيفي',      selectable: true,  default: true },
    { id: 'jobAttribute', label: 'الصفة الوظيفية',      selectable: true },
    { id: 'jobCategory',  label: 'الفئة الوظيفية',      selectable: true },
    { id: 'appointmentType', label: 'نوع التعيين',      selectable: true },
    { id: 'decisionAttribute', label: 'صفة التعيين',    selectable: true },

    { id: 'placeCode',    label: 'مكان العمل',          selectable: true },
    { id: 'startingSalary', label: 'الراتب',            selectable: true },

    // تواريخ أساسية ثابتة
    { id: 'birthDate',    label: 'تاريخ الميلاد',       selectable: true },
    { id: 'workDate',     label: 'تاريخ التعيين',       selectable: true },
    { id: 'dateActionWork', label: 'تاريخ المباشرة',    selectable: true },

    // معلومات حالة حالية (تُعرض كأعمدة منفصلة لكن دون تكرار)
    { id: 'datecurrentDecisionAppointment', label: 'تاريخ قرار الحالة', selectable: true },
    { id: 'currentDecisionAppointment',     label: 'قرار الحالة',       selectable: true },

    // معلومات إضافية
    { id: 'education',    label: 'التحصيل العلمي',      selectable: true,  default: true },
    { id: 'bloodType',    label: 'زمرة الدم',           selectable: true },

    { id: 'actions',      label: 'إجراءات',             selectable: false, always: true },
  ];

  private idToLabel = new Map<ColId, string>(this.allColumns.map(c => [c.id, c.label] as [ColId, string]));

  // واجهة
  activeChips: Array<{ key: string; label: string; value: string }> = [];
  flatPlaces: Array<{ code: string; name: string }> = [];

  // أدوات مساعدة UI
  goHome() { this.router.navigate(['']); }
  today = () => new Date();
  columnLabel = (id: ColId) => this.idToLabel.get(id) ?? '';
dialogForm = this.fb.group({
  placeIncludeChildren: [true],
});
private normalizePlaceFromDialog(codes: string[] | undefined): string[] {
  const allCodes = this.flatPlaces.map(p => p.code);                 // المصدر الموثوق لكل الأكواد
  const uniq = Array.from(new Set((codes ?? []).filter(c => allCodes.includes(c))));

  if (uniq.length === 0) return [this.ALL];                          // لا شيء مختار => الكل
  if (uniq.length === allCodes.length) return [this.ALL];            // كلهم => الكل
  return uniq;                                                       // جزء فقط => بدون ALL
}

stringCompare = (a: string, b: string) => a === b;

onPlaceSelectionChange(ev: import('@angular/material/select').MatSelectChange) {
  let sel: string[] = Array.isArray(ev.value) ? [...ev.value] : [];

  // تطبيع "الكل"
  if (!sel.length) sel = [this.ALL];
  if (sel.includes(this.ALL) && sel.length > 1) sel = [this.ALL];

  this.filtersForm.get('placeCode')!.setValue(sel, { emitEvent: true });
  this.saveFilters();
  this.triggerFilter();
  this.cdr.markForCheck();
}

  // ====== Lifecycle ======
  ngOnInit(): void {

    
    // استرجاع الوضع
    const savedMode = (localStorage.getItem(this.MODE_KEY) as SearchMode | null);
    this.mode = savedMode === 'current' ? 'current' : 'base';

    // 1) أعمدة افتراضية
    this.columnPicker = this.fb.nonNullable.control<ColId[]>([]);

    // 2) نموذج الفلاتر (موحد)
    this.filtersForm = this.fb.group({
      gender: [''],
      // فلاتر موحّدة تُطبّق حسب mode
      jobTitle: [[this.ALL] as string[]],
      jobAttribute: [[this.ALL] as string[]],
      jobCategory: [[this.ALL] as string[]],
      appointmentType: [[this.ALL] as string[]],
      decisionAttribute: [[this.ALL] as string[]],

      education: [[this.ALL] as string[]],
      bloodType: [[this.ALL] as string[]],
      placeCode: [[this.ALL] as string[]],
 placeIncludeChildren: [true],   // ✅ جديد: شمل الفروع
  placePickMode: ['tree'],        // (اختياري) 'tree' | 'flat'
      // نص عام
      q: [''],

      // تواريخ عامة
      birthFrom: [null as Date | null],
      birthTo:   [null as Date | null],
      workFrom:  [null as Date | null],
      workTo:    [null as Date | null],
      actionFrom:[null as Date | null],
      actionTo:  [null as Date | null],

      // نطاق راتب (يُطبّق على الأساسي/الحالي حسب mode)
      salaryFrom:[null as number | null],
      salaryTo:  [null as number | null],

      // فلاتر حالة حالية اختيارية
      currentDecisionAppointment: [''],
      currentDecisionDateFrom: [null as Date | null],
      currentDecisionDateTo:   [null as Date | null],

      // جنسيات
      nationalities: [[] as string[]],
    });


    // 3) بيانات الجدول + فلترة
this.dataSource.filterPredicate = (row, _f) => this.applyPredicate(row);

// حمِّل الأساس أولاً كـ fallback سريع (اختياري)
this.dataSource.data = this.store.list();

// ثم اشتقّ الحالة الحالية لكل موظف
this.hydrateCurrentSnapshots();

    // 3) بيانات الجدول + فلترة
    // this.dataSource.data = this.store.list();
    // this.dataSource.filterPredicate = (row, _f) => this.applyPredicate(row);


    this.org.tree$
  .pipe(takeUntil(this.destroy$))
  .subscribe(tree => {
    // خزّن الشجرة لاستخدامها في الـ pipe وفي البحث عن الاسم
    this.orgTree = tree ?? [];

    // حدّث قائمة الأماكن المفلطحة لقائمة الاختيار
    this.flatPlaces = [];
    this.flattenOrgs(this.orgTree, this.flatPlaces);
this.buildDescendantsMap(this.orgTree);

    // حدّث خيارات الفلتر + تأكد من تماسك قيمة الكنترول
    // حدّث خيارات الفلتر + تأكد من تماسك قيمة الكنترول
    this.OPTIONS['placeCode'] = this.flatPlaces.map(p => p.code);
    this.syncControlWithOptions('placeCode', this.OPTIONS['placeCode']);

    // أعد تطبيق الفلترة لأن البيانات تغيّرت
    this.triggerFilter();
    this.cdr.markForCheck();
  });

    // 4) تسطيح الشجرة وتعبئة placeCode في OPTIONS
    // this.flattenOrgs(this.orgTree, this.flatPlaces);
    
    // this.OPTIONS.placeCode = this.flatPlaces.map(p => p.code);

    // 5) تحميل حالة الفلاتر
    const saved = this.loadFilters();
    if (saved) {
      if (!Array.isArray(saved.education) || !saved.education.length) {
        saved.education = [this.ALL];
      }
      this.filtersForm.patchValue(saved, { emitEvent: false });
    }
    this.refreshActiveChips();
    this.triggerFilter();

    // 6) حالة الأعمدة
    const savedColsRaw = localStorage.getItem(this.TABLE_STATE_KEY);
    if (savedColsRaw) {
      try {
        const savedCols = JSON.parse(savedColsRaw) as ColId[];
        this.columnPicker.setValue(savedCols, { emitEvent: false });
      } catch {}
    } else {
      const defaults = this.allColumns.filter(c => c.selectable && c.default).map(c => c.id as ColId);
      this.columnPicker.setValue(defaults, { emitEvent: false });
    }

    // ===== الاشتراكات =====
    this.filtersForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.saveFilters();
        this.refreshActiveChips();
        this.triggerFilter();
      });

      // داخل ngOnInit بعد إنشاء this.filtersForm
this.filtersForm.addControl('placeIncludeChildren', this.fb.control(true));


    this.columnPicker.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(cols => {
        localStorage.setItem(this.TABLE_STATE_KEY, JSON.stringify(cols ?? []));
      });

    // لوائح من LookupService
    this.lookup.genders$
      .pipe(takeUntil(this.destroy$))
      .subscribe(opts => { this.gendersOpts = opts; this.cdr.markForCheck(); });

    this.lookup.jobTitles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(opts => {
        this.jobTitleOpts = opts;
        this.jobTitleValues = opts.map(o => o.value);
        this.OPTIONS['jobTitle'] = this.jobTitleValues;
        this.cdr.markForCheck();
      });

    this.lookup.jobAttributes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(opts => {
        this.jobAttributeOpts = opts;
        this.jobAttributeValues = opts.map(o => o.value);
        this.OPTIONS['jobAttribute'] = this.jobAttributeValues;
        this.syncControlWithOptions('jobAttribute', this.jobAttributeValues);
        this.cdr.markForCheck();
      });

    this.lookup.jobCategories$
      .pipe(takeUntil(this.destroy$))
      .subscribe(opts => {
        this.jobCategoryOpts = opts;
        this.jobCategoryValues = opts.map(o => o.value);
        this.OPTIONS['jobCategory'] = this.jobCategoryValues;
        this.syncControlWithOptions('jobCategory', this.jobCategoryValues);
        this.cdr.markForCheck();
      });

    this.lookup.appointmentTypes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(opts => {
        this.appointmentTypesOpts = opts;
        this.appointmentTypeValues = opts.map(o => o.value);
        this.OPTIONS['appointmentType'] = this.appointmentTypeValues;
        this.syncControlWithOptions('appointmentType', this.appointmentTypeValues);
        this.cdr.markForCheck();
      });

    this.lookup.decisionAttributes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(opts => {
        this.decisionAttributeOpts = opts;
        this.decisionAttributeValues = opts.map(o => o.value);
        this.OPTIONS['decisionAttribute'] = this.decisionAttributeValues;
        this.syncControlWithOptions('decisionAttribute', this.decisionAttributeValues);
        this.cdr.markForCheck();
      });

    this.lookup.educations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(opts => {
        this.educationOpts = opts;
        this.educationValues = opts.map(o => o.value);
        this.OPTIONS['education'] = this.educationValues;
        this.syncControlWithOptions('education', this.educationValues);
        this.cdr.markForCheck();
      });

    this.lookup.bloodTypes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(opts => {
        this.bloodTypeOpts = opts;
        this.bloodTypeValues = opts.map(o => o.value);
        this.OPTIONS['bloodType'] = this.bloodTypeValues;
        this.cdr.markForCheck();
      });


     this.lookup.nationalities$
  .pipe(
    takeUntil(this.destroy$),
    map(opts => opts.map(o => o.label).sort((a,b) => a.localeCompare(b,'ar'))),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  )
  .subscribe(list => {
    this.nationalities = list;
    this.cdr.markForCheck();
  });

    
  }

private descendantsMap = new Map<string, string[]>();

private buildDescendantsMap(nodes: OrgNode[]) {
  // امسح القديم
  this.descendantsMap.clear();
  // مرور DFS لتجميع كل الأحفاد لكل عقدة
  const gather = (n: OrgNode): string[] => {
    const me = n.code ? [n.code] : [];
    const kids = (n.subs ?? []).flatMap(gather);
    const all = me.concat(kids);
    if (n.code) this.descendantsMap.set(n.code, all);
    return all;
  };
  nodes.forEach(gather);
}
private expandPlaceSelection(sel: string[], includeChildren: boolean): Set<string> {
  const S = new Set<string>();
  for (const code of sel) {
    if (code === this.ALL) { S.add(this.ALL); continue; }
    if (includeChildren) {
      const all = this.descendantsMap.get(code) ?? [code];
      for (const c of all) S.add(c);
    } else {
      S.add(code);
    }
  }
  return S;
}


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
      console.log('SAMPLE EMP', this.dataSource.data[0]);


    // فرز يعتمد على الوضع للأعمدة الموحّدة
    this.dataSource.sortingDataAccessor = (row: Employee, column: string) => {
      switch (column as ColId) {
        case 'birthDate': {
          const d = row.birthDate instanceof Date ? row.birthDate : (row.birthDate ? new Date(row.birthDate) : null);
          return d?.getTime?.() ?? 0;
        }
        case 'workDate': {
          const d = row.workDate instanceof Date ? row.workDate : (row.workDate ? new Date(row.workDate) : null);
          return d?.getTime?.() ?? 0;
        }
        case 'dateActionWork': {
          const d = row.dateActionWork instanceof Date ? row.dateActionWork : (row.dateActionWork ? new Date(row.dateActionWork) : null);
          return d?.getTime?.() ?? 0;
        }

        // حقول تتبدّل حسب الوضع
        case 'jobTitle':
        case 'jobAttribute':
        case 'jobCategory':
        case 'appointmentType':
        case 'decisionAttribute':
        case 'placeCode':
        case 'currentDecisionAppointment':
          return (this.fieldOf(row, column as any) ?? '').toString();

        case 'startingSalary': {
          const v = this.fieldOf(row, 'startingSalary');
          const n = Number(v ?? 0);
          return Number.isFinite(n) ? n : 0;
        }

        case 'datecurrentDecisionAppointment': {
          const v = this.fieldOf(row, 'datecurrentDecisionAppointment');
          const d = v instanceof Date ? v : (v ? new Date(v as any) : null);
          return d?.getTime?.() ?? 0;
        }

        case 'fullName':
          return `${row.firstName ?? ''} ${row.fatherName ?? ''} ${row.lastName ?? ''}`.trim();

        default:
          return (row as any)[column] ?? '';

          
      }
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== تبديل الوضع =====
  public setMode(v: SearchMode) {
    if (this.mode === v) return;
    this.mode = v;
    localStorage.setItem(this.MODE_KEY, v);
    this.triggerFilter();  // يعيد تصفية/عرض الجدول بالقيم الجديدة
    this.cdr.markForCheck();
  }

  // ===== أدوات فلترة/عرض =====
  public applyGlobal(q: string) {
    this.filtersForm.patchValue({ q }, { emitEvent: true });
  }

  private triggerFilter() {
    // hack لتفعيل filterPredicate
    this.dataSource.filter = String(Date.now());
  }

  private normalize(v: any): string {
    return (v ?? '').toString().trim().toLowerCase();
  }

  private onlyDate(d: Date): Date {
    const x = new Date(d); x.setHours(0, 0, 0, 0); return x;
  }

  private inRangeDate(value: any, from?: Date | null, to?: Date | null): boolean {
    if (!from && !to) return true;
    if (!value) return false;
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return false;
    if (from && d < this.onlyDate(from)) return false;
    if (to && d > this.onlyDate(to)) return false;
    return true;
  }

  private inRangeNumber(value: any, from?: number | null, to?: number | null): boolean {
    if (from == null && to == null) return true;
    const n = Number(value);
    if (Number.isNaN(n)) return false;
    if (from != null && n < from) return false;
    if (to != null && n > to) return false;
    return true;
  }

  private nationalityMatches(rowNat: any, selected: string[]): boolean {
    if (!selected?.length) return true;
    const arr = Array.isArray(rowNat)
      ? (rowNat as string[])
      : (typeof rowNat === 'string' ? rowNat.split(/[,\u060C]/).map(s => s.trim()) : []);
    if (!arr.length) return false;
    return selected.some(s => arr.includes(s));
  }

  private ymd(d?: Date | null): string {
    if (!d) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  

  // قلب التبديل: يقرأ القيمة حسب الوضع
  // public fieldOf(
  //   e: Employee,
  //   id: ColId | 'placeCode' | 'jobTitle' | 'appointmentType' | 'startingSalary' | 'datecurrentDecisionAppointment'
  // ): string | Date | null | undefined {
  //   const base = {
  //     jobTitle: e.jobTitle ?? '',
  //     jobCategory: e.jobCategory ?? '',
  //     jobAttribute: e.jobAttribute ?? '',
  //     appointmentType: e.appointmentType ?? '',
  //     decisionAttribute: e.decisionAttribute ?? '',
  //     placeCode: e.placeActionWork ?? '',
  //     startingSalary: e.startingSalary ?? '',
  //     datecurrentDecisionAppointment: null as Date | null,
  //     currentDecisionAppointment: e.currentDecisionAppointment ?? '',
  //   } as const;

  //   const current = {
  //     jobTitle: e.currentJobTitle ?? base.jobTitle,
  //     jobCategory: e.currentJobCategory ?? base.jobCategory,
  //     jobAttribute: e.currentJobAttribute ?? base.jobAttribute,
  //     appointmentType: e.currentappointmentType ?? base.appointmentType, // لديك a صغيرة
  //     decisionAttribute: base.decisionAttribute, // إن كان لديك حقل current لها بدّله هنا
  //     placeCode: e.currentJoblocation ?? base.placeCode,
  //     startingSalary: e.currentSalary ?? base.startingSalary,
  //     datecurrentDecisionAppointment: e.datecurrentDecisionAppointment ?? null,
  //     currentDecisionAppointment: e.currentDecisionAppointment ?? '',
  //   } as const;

  //   const pick = this.mode === 'current' ? current : base;
  //   return (pick as any)[id];
  // }

public fieldOf(e: Employee, id: 'datecurrentDecisionAppointment'): Date | null;
public fieldOf(
  e: Employee,
  id:
    | 'startingSalary' | 'jobTitle' | 'jobAttribute' | 'jobCategory'
    | 'appointmentType' | 'decisionAttribute' | 'placeCode'
    | 'currentDecisionAppointment'
): string;
public fieldOf(
  e: Employee,
  id: ColId | 'placeCode' | 'jobTitle' | 'appointmentType' | 'startingSalary' | 'datecurrentDecisionAppointment'
): any {
  const base = {
    jobTitle:                 pickStr((e as any).jobTitle),
    jobCategory:              pickStr((e as any).jobCategory),
    jobAttribute:             pickStr((e as any).jobAttribute),
    appointmentType:          pickStr((e as any).appointmentType),
    decisionAttribute:        pickStr((e as any).decisionAttribute),
    placeCode:                pickStr((e as any).placeActionWork),
    startingSalary:           pickStr((e as any).startingSalary),
    datecurrentDecisionAppointment: null as Date | null,
    currentDecisionAppointment:     pickStr((e as any).currentDecisionAppointment),
  } as const;

  // ✅ تغطية كل الأسماء/المسارات المحتملة حسب الـdump الذي أرسلته
  const current = {
    jobTitle:                 pickStr((e as any).currentJobTitle,                (e as any).workdetails?.currentJobTitle,                base.jobTitle),
    jobCategory:              pickStr((e as any).currentJobCategory,             (e as any).workdetails?.currentJobCategory,             base.jobCategory),
    jobAttribute:             pickStr((e as any).currentJobAttribute,            (e as any).workdetails?.currentJobAttribute,            base.jobAttribute),

    // انتبه: عندك currentappointmentType (a صغيرة) وأحيانًا Current + في workdetails
    appointmentType:          pickStr((e as any).currentAppointmentType, (e as any).currentappointmentType, (e as any).workdetails?.currentAppointmentType, base.appointmentType),

    // لا يوجد لديك currentDecisionAttribute؛ لو أضفته لاحقًا غيّره هنا
    decisionAttribute:        base.decisionAttribute,

    // انتبه: currentJoblocation (l صغيرة) وأحيانًا Current + في workdetails
    placeCode:                pickStr((e as any).currentJobLocation, (e as any).currentJoblocation, (e as any).workdetails?.currentJobLocation, base.placeCode),

    // قد تكون في details أو كسلسلة أرقام
    startingSalary:           pickStr((e as any).currentSalary, (e as any).details?.currentSalary, base.startingSalary),

    datecurrentDecisionAppointment:
                              pickDate((e as any).datecurrentDecisionAppointment, (e as any).workdetails?.datecurrentDecisionAppointment),

    currentDecisionAppointment:
                              pickStr((e as any).currentDecisionAppointment, (e as any).workdetails?.currentDecisionAppointment, ''),
  } as const;

  const pick = this.mode === 'current' ? current : base;
  return (pick as any)[id];
}


  public fieldOfStr(
    e: Employee,
    id: ColId | 'placeCode' | 'jobTitle' | 'appointmentType' | 'startingSalary' | 'datecurrentDecisionAppointment'
  ): string {
    const v = this.fieldOf(e, id as any);
    return v == null ? '' : String(v);
  }

  public fieldOfPlacePath(e: Employee): string | null {
    const v = this.fieldOf(e, 'placeCode');
     return v ? String(v) : null;

  }

  private arrCtrl(name: string): string[] {
  const v = (this.filtersForm.value as any)[name];
  return Array.isArray(v) ? v : [];
}
// const placeSel = this.arrCtrl('placeCode');


  // ===== منطق الفلاتر =====
  private eduValueMatches(rowEdu: string, selected: string[]): boolean {
    if (!selected.length) return true;
    if (selected.includes(rowEdu)) return true;
    const byLabel = this.educationOpts.find(o => o.label === rowEdu)?.value;
    return byLabel ? selected.includes(byLabel) : false;
  }

  private async hydrateCurrentSnapshots() {
  const base = this.store.list();
  const enriched = await Promise.all(base.map(async (e) => {
    try {
      const changes = await this.port.list(e.id);
      // اشتقّ اللقطة الحالية بنفس خوارزمية browse
      return deriveCurrentState(e, changes);
    } catch {
      return e; // فشل المنفذ؟ اعرض الأساس
    }
  }));

  // مهم: مرجع جديد للمصفوفة كي يلتقط الجدول التغيير
  this.dataSource.data = [...enriched];
  this.triggerFilter();
  this.cdr.markForCheck();
}


  private applyPredicate(e: Employee): boolean {
    const f = this.filtersForm.value;

    // 1) البحث العام
    const queryText = this.normalize(String(f.q ?? ''));
    if (queryText) {
      const hay = [
        e.firstName, e.fatherName, e.lastName, e.motherName,
        this.fieldOf(e, 'jobTitle'),
        e.paperFileNumber, e.nationalNumber, e.idNumber,
        e.permenentAddress, e.residence,
        this.fieldOf(e, 'placeCode'),
        this.ymd(e.birthDate), this.ymd(e.workDate), this.ymd(e.dateActionWork),
        this.mode === 'current' ? this.ymd(this.fieldOf(e,'datecurrentDecisionAppointment') as any) : ''
      ].map(v => this.normalize(v)).join(' ');
      if (!hay.includes(queryText)) return false;
    }

    // 2) فلاتر قوائم موحدة (حسب الوضع)
    for (const key of ['jobTitle','jobCategory','jobAttribute','appointmentType'] as const) {
      const sel = (f[key] ?? []) as string[];
      const isAll = !sel.length || sel.includes(this.ALL);
      if (!isAll) {
        const raw = (this.fieldOf(e, key) ?? '').toString();
        const asValue =
          (this as any)[`${key}Opts`].find((o: LookupOption) => o.value === raw)?.value ??
          (this as any)[`${key}Opts`].find((o: LookupOption) => o.label === raw)?.value ?? raw;
        if (!sel.includes(asValue)) return false;
      }
    }

    // صفة التعيين (إن أردتها على الأساسي فقط، أو تُوحَّد مثل ما سبق إن لديك current لها)
    {
      const sel = (f.decisionAttribute ?? []) as string[];
      const isAll = !sel.length || sel.includes(this.ALL);
      if (!isAll) {
        const raw = (this.fieldOf(e,'decisionAttribute') ?? '').toString();
        const asValue =
          this.decisionAttributeOpts.find(o => o.value === raw)?.value ??
          this.decisionAttributeOpts.find(o => o.label === raw)?.value ?? raw;
        if (!sel.includes(asValue)) return false;
      }
    }

    // التعليم
    {
      const eduSel: string[] = (f.education ?? []) as string[];
      const eduAll = !eduSel.length || eduSel.includes(this.ALL);
      if (!eduAll) {
        const rowEdu = (e.education ?? '').toString();
        if (!this.eduValueMatches(rowEdu, eduSel)) return false;
      }
    }

    // زمرة الدم
    {
      const bloodSel: string[] = (f.bloodType ?? []) as string[];
      const bloodAll = !bloodSel.length || bloodSel.includes(this.ALL);
      if (!bloodAll) {
        const rowBlood = (e.bloodType ?? '').toString();
        if (!bloodSel.includes(rowBlood)) return false;
      }
    }

    // مكان العمل (حسب الوضع)
   {
  const placeSel: string[] = ((this.filtersForm.value as any)['placeCode'] ?? []) as string[];
  const includeChildren = !!((this.filtersForm.value as any)['placeIncludeChildren']);
  const placeAll = !placeSel.length || placeSel.includes(this.ALL);
  if (!placeAll) {
    const expanded = this.expandPlaceSelection(placeSel, includeChildren);
    const raw = (this.fieldOf(e, 'placeCode') ?? '').toString();
    const parts = normalizeWorkPath(raw); // لديك هذه الدالة
    if (!parts.length) return false;

    // المطابقة هنا على أي جزء من المسار
    const hit = parts.some(p => expanded.has(p));
    if (!hit) return false;
  }
}

    // 3) فلاتر مفردة ثابتة
    if (f.gender && e.gender !== f.gender) return false;
    if (!this.nationalityMatches(e.nationality as any, f.nationalities ?? [])) return false;

    // 4) نطاقات تواريخ ثابتة
    if (!this.inRangeDate(e.birthDate, f.birthFrom, f.birthTo)) return false;
    if (!this.inRangeDate(e.workDate, f.workFrom, f.workTo)) return false;
    if (!this.inRangeDate(e.dateActionWork, f.actionFrom, f.actionTo)) return false;

    // 5) نطاق الراتب (موحّد حسب الوضع)
    // {
    //   const val = this.mode === 'current'
    //     ? Number((e as any).currentSalary ?? (e as any).startingSalary)
    //     : Number((e as any).startingSalary ?? (e as any).currentSalary);
    //   if (!this.inRangeNumber(val, f.salaryFrom, f.salaryTo)) return false;
    // }

    {
  const val = Number(this.fieldOf(e, 'startingSalary') ?? 0);
  if (!this.inRangeNumber(val, f.salaryFrom, f.salaryTo)) return false;
}


    // 6) فلاتر حالة حالية اختيارية
    if ((f.currentDecisionAppointment ?? '').toString().trim()) {
  const needle = this.normalize(f.currentDecisionAppointment);
  const hay = this.normalize(this.fieldOf(e,'currentDecisionAppointment') as any);
  if (!hay.includes(needle)) return false;
}

    if (!this.inRangeDate(this.fieldOf(e, 'datecurrentDecisionAppointment') as any,
                      f.currentDecisionDateFrom, f.currentDecisionDateTo)) {
  return false;
}


    return true;
  }  


  get displayedColumns(): string[] {
  const picked = new Set(this.columnPicker.value ?? []);
  return this.allColumns
    .filter(c => c.always || (c.selectable && picked.has(c.id)))
    .map(c => c.id);
}

public selectAllColumns() {
  const all = this.allColumns.filter(c => c.selectable).map(c => c.id as ColId);
  this.columnPicker.setValue(all);
  localStorage.setItem(this.TABLE_STATE_KEY, JSON.stringify(all));
}

public clearColumns() {
  this.columnPicker.setValue([]);
  localStorage.setItem(this.TABLE_STATE_KEY, JSON.stringify([]));
}



  // ===== UI: chips & option toggles =====
  public labelOf = (opts: LookupOption[], value: string): string =>
    opts.find(o => o.value === value)?.label ?? value;

  private refreshActiveChips() {
    const f = this.filtersForm.value;
    const chips: Array<{ key: string; label: string; value: string }> = [];

    if (f.q) chips.push({ key: 'q', label: 'بحث', value: f.q! });

    const pushMulti = (key: keyof typeof f, label: string, opts: LookupOption[]) => {
      const arr = (f[key] ?? []) as string[];
      if (Array.isArray(arr) && arr.length) {
        const vals = arr.includes(this.ALL) ? ['الكل'] : arr.map(v => this.labelOf(opts, v));
        chips.push({ key: key as string, label, value: vals.join('، ') });
      }

    };
    const _place = (this.filtersForm.value as any)['placeCode'] as string[] | undefined;
    const includeChildren = !!((this.filtersForm.value as any)['placeIncludeChildren']);

if (Array.isArray(_place) && _place.length) {
  const vals = _place.includes(this.ALL)
    ? ['الكل']
    : _place.map((c: string) => this.findNameByCode(c) ?? c);
  const suffix = includeChildren ? ' (مع الفروع)' : '';
  chips.push({ key: 'placeCode', label: 'مكان العمل', value: vals.join('، ') + suffix });
}

    pushMulti('jobTitle', 'المسمى', this.jobTitleOpts);
    pushMulti('jobAttribute', 'الصفة الوظيفية', this.jobAttributeOpts);
    pushMulti('jobCategory', 'الفئة الوظيفية', this.jobCategoryOpts);
    pushMulti('appointmentType', 'نوع التعيين', this.appointmentTypesOpts);
    pushMulti('decisionAttribute', 'صفة التعيين', this.decisionAttributeOpts);

    // التعليم والدم
    pushMulti('education', 'التحصيل', this.educationOpts);
    pushMulti('bloodType', 'زمرة', this.bloodTypeOpts);

    if (Array.isArray(f.placeCode) && f.placeCode.length) {
      const vals = f.placeCode.includes(this.ALL)
        ? ['الكل']
        : f.placeCode.map((c: string) => this.findNameByCode(c) ?? c);
      chips.push({ key: 'placeCode', label: 'مكان العمل', value: vals.join('، ') });
    }

    if (f.gender) chips.push({ key: 'gender', label: 'الجنس', value: this.labelOf(this.gendersOpts, f.gender) });

    if (f.nationalities?.length) {
      chips.push({ key: 'nationalities', label: 'الجنسية', value: f.nationalities!.join('، ') });
    }

    if (f.birthFrom) chips.push({ key: 'birthFrom', label: 'ميلاد من', value: f.birthFrom!.toLocaleDateString('ar-SY') });
    if (f.birthTo) chips.push({ key: 'birthTo', label: 'ميلاد إلى', value: f.birthTo!.toLocaleDateString('ar-SY') });
    if (f.workFrom) chips.push({ key: 'workFrom', label: 'تعيين من', value: f.workFrom!.toLocaleDateString('ar-SY') });
    if (f.workTo) chips.push({ key: 'workTo', label: 'تعيين إلى', value: f.workTo!.toLocaleDateString('ar-SY') });
    if (f.actionFrom) chips.push({ key: 'actionFrom', label: 'مباشرة من', value: f.actionFrom!.toLocaleDateString('ar-SY') });
    if (f.actionTo) chips.push({ key: 'actionTo', label: 'مباشرة إلى', value: f.actionTo!.toLocaleDateString('ar-SY') });

    if (f.salaryFrom != null) chips.push({ key: 'salaryFrom', label: 'راتب من', value: String(f.salaryFrom) });
    if (f.salaryTo != null) chips.push({ key: 'salaryTo', label: 'راتب إلى', value: String(f.salaryTo) });

    if (f.currentDecisionAppointment) {
      chips.push({ key: 'currentDecisionAppointment', label: 'قرار الحالة', value: f.currentDecisionAppointment! });
    }
    if (f.currentDecisionDateFrom) chips.push({ key: 'currentDecisionDateFrom', label: 'قرار من', value: f.currentDecisionDateFrom!.toLocaleDateString('ar-SY') });
    if (f.currentDecisionDateTo) chips.push({ key: 'currentDecisionDateTo', label: 'قرار إلى', value: f.currentDecisionDateTo!.toLocaleDateString('ar-SY') });

    this.activeChips = chips;
  }

  public placeBreadcrumb(e: Employee): string {
  const raw = this.fieldOf(e, 'placeCode') || '';
  const parts = normalizeWorkPath(raw);
  const names = parts
    .map(c => this.findNameByCode(c) ?? c)
    .filter(Boolean);
  return names.join(' / ');
}

public placeLeafName(e: Employee): string {
  const raw = this.fieldOf(e, 'placeCode') || '';
  const parts = normalizeWorkPath(raw);
  const last = parts.at(-1);
  return last ? (this.findNameByCode(last) ?? last) : '';
}
openPlaceTreeDialog(select?: MatSelect) {
  const currentSel: string[] = (this.filtersForm.value.placeCode as string[]) ?? [];
  const includeChildren = !!this.filtersForm.value.placeIncludeChildren;
  select?.close();

  this.dialog.open(PlaceTreeDialogComponent, {
    data: {
      tree: this.orgTree,
      selected: (this.filtersForm.value.placeCode as string[])?.includes(this.ALL)
                  ? [] : (this.filtersForm.value.placeCode as string[]) ?? [],
      includeChildren: !!this.filtersForm.value.placeIncludeChildren,
    },
    width: '900px',
  })
  .afterClosed()
  .subscribe((res?: { codes: string[]; includeChildren: boolean }) => {
    if (!res) return;

    const placeCode = this.normalizePlaceFromDialog(res.codes);   // 👈 هنا التطبيع

    this.filtersForm.patchValue(
      {
        placeCode,
        placeIncludeChildren: res.includeChildren,
      },
      { emitEvent: true }
    );

    this.saveFilters?.();
    this.triggerFilter?.();
    this.cdr.markForCheck();
  });
}


  public onOptionToggle(controlName: keyof typeof this.OPTIONS, e: MatOptionSelectionChange, value: string) {
    if (!e.isUserInput) return;
    const ALL = this.ALL;
    let selected: string[] = [...((this.filtersForm.value[controlName] as string[]) ?? [])];

    if (value === ALL) {
      selected = e.source.selected ? [ALL] : [];
    } else {
      if (e.source.selected) {
        selected = selected.filter(v => v !== ALL);
        if (!selected.includes(value)) selected.push(value);
      } else {
        selected = selected.filter(v => v !== value);
        if (selected.length === 0) selected = [ALL];
      }
    }

    this.filtersForm.patchValue({ [controlName]: selected });
    this.saveFilters();
    this.triggerFilter();
  }

  private syncControlWithOptions(controlName: keyof typeof this.OPTIONS, validValues: string[]) {
    const current = (this.filtersForm.value[controlName] as string[] | null) ?? [];
    if (!current.length) return;
    if (current.includes(this.ALL)) return;
    const filtered = current.filter(v => validValues.includes(v));
    if (filtered.length !== current.length) {
      this.filtersForm.patchValue({ [controlName]: (filtered.length ? filtered : [this.ALL]) });
    }
  }

  public removeChip(c: { key: string }) {
    const patch: any = { [c.key]: Array.isArray((this.filtersForm.value as any)[c.key]) ? [] : '' };
    if (['education','bloodType','placeCode','jobTitle','jobAttribute','jobCategory','appointmentType','decisionAttribute','nationalities'].includes(c.key)) {
      patch[c.key] = [];
    }
    if (['birthFrom','birthTo','workFrom','workTo','actionFrom','actionTo','currentDecisionDateFrom','currentDecisionDateTo','salaryFrom','salaryTo'].includes(c.key)) {
      patch[c.key] = null;
    }
    if (c.key === 'currentDecisionAppointment') patch[c.key] = '';
    this.filtersForm.patchValue(patch);
  }

  public resetFilters() {
    this.filtersForm.reset({
      gender: '',
      jobTitle: [this.ALL],
      jobAttribute: [this.ALL],
      jobCategory: [this.ALL],
      appointmentType: [this.ALL],
      decisionAttribute: [this.ALL],
      education: [this.ALL],
      bloodType: [this.ALL],
      placeCode: [this.ALL],
        placeIncludeChildren: true, // 

      nationalities: [],
      birthFrom: null, birthTo: null,
      workFrom: null, workTo: null,
      actionFrom: null, actionTo: null,
      salaryFrom: null, salaryTo: null,
      q: '',
      currentDecisionAppointment: '',
      currentDecisionDateFrom: null,
      currentDecisionDateTo: null,

    });
    localStorage.removeItem(this.STORAGE_KEY);
    this.triggerFilter();
  }

  // ===== Helpers =====
  private flattenOrgs(nodes: OrgNode[], acc: Array<{ code: string; name: string }>) {
    for (const n of nodes) {
      if (n.code) acc.push({ code: n.code, name: n.name });
      if (n.subs?.length) this.flattenOrgs(n.subs, acc);
    }
  }

   findNameByCode(code: string): string | null {
    const stack: OrgNode[] = [...this.orgTree];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.code === code) return n.name;
      if (n.subs?.length) stack.push(...n.subs);
    }
    return null;
  }

  public browseEmployee(emp: Employee) {
    this.router.navigate(['/employees/browse', emp.id]);
  }

 

editEmployee(e: Employee) {
  this.router.navigate(['/employees/edit', e.id]);
}

confirmRemove(e: Employee) {
  const ok = confirm(`هل تريد حذف ${e.firstName} ${e.lastName}؟`);
  if (ok) this.remove(e);
}

refresh() {
    this.dataSource.data = this.store.list(); // تعبئة الجدول
  }

remove(emp: Employee) {
    const ok = confirm(`هل أنت متأكد من حذف الموظف: ${emp.firstName} ${emp.lastName}؟`);
    if (!ok) return;
    if (typeof (this.store as any).remove === 'function') {
      (this.store as any).remove(emp.id);
    } else {
      const rest = this.store.list().filter(e => e.id !== emp.id);
      localStorage.setItem('employees', JSON.stringify(rest));
    }
    this.refresh();
  }


  private saveFilters() {
    const v = this.filtersForm.value;
    const toISO = (d: Date | null | undefined) => (d ? new Date(d).toISOString() : null);
    const payload = {
      ...v,
      birthFrom: toISO(v.birthFrom),
      birthTo: toISO(v.birthTo),
      workFrom: toISO(v.workFrom),
      workTo: toISO(v.workTo),
      actionFrom: toISO(v.actionFrom),
      actionTo: toISO(v.actionTo),
      currentDecisionDateFrom: toISO(v.currentDecisionDateFrom),
      currentDecisionDateTo: toISO(v.currentDecisionDateTo),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
  }

  private loadFilters(): any | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    const toDate = (s: string | null) => (s ? new Date(s) : null);
    return {
      ...p,
      birthFrom: toDate(p.birthFrom),
      birthTo: toDate(p.birthTo),
      workFrom: toDate(p.workFrom),
      workTo: toDate(p.workTo),
      actionFrom: toDate(p.actionFrom),
      actionTo: toDate(p.actionTo),
      currentDecisionDateFrom: toDate(p.currentDecisionDateFrom),
      currentDecisionDateTo: toDate(p.currentDecisionDateTo),
          placeIncludeChildren: typeof p.placeIncludeChildren === 'boolean' ? p.placeIncludeChildren : true, // 👈 افتراضي

    };
  }

  // لابل الأعمدة
  trackByValue = (_: number, it: { value: string }) => it.value;
}

// ===== Types =====
type ColId =
  | 'index' | 'fullName'
  | 'jobTitle' | 'jobAttribute' | 'jobCategory' | 'appointmentType' | 'decisionAttribute'
  | 'placeCode' | 'startingSalary'
  | 'birthDate' | 'workDate' | 'dateActionWork'
  | 'datecurrentDecisionAppointment' | 'currentDecisionAppointment'
  | 'education' | 'bloodType'
  | 'actions';

interface ColumnDef {
  id: ColId;
  label: string;
  selectable: boolean;
  always?: boolean;
  default?: boolean;
}

function normalizeWorkPath(raw: unknown): string[] {
  return String(raw)
    .split(/[|/>.]/)
    .map((s: string) => s.trim())
    .filter((x): x is string => x.length > 0);
}

function pickStr(...vals: Array<unknown>): string {
  for (const v of vals) if (v != null && v !== '') return String(v);
  return '';
}
function pickDate(...vals: Array<unknown>): Date | null {
  for (const v of vals) {
    if (v instanceof Date && !isNaN(v.getTime())) return v;
    if (typeof v === 'string' && v) {
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

