import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionSelectionChange } from '@angular/material/core';

import { LocalEmployeesService, Employee } from '../../../services/local-employees.service';
import { DEPARTMENTS, OrgNode } from '../../../models/department';
import { OrgNamePipe } from '../../../pipes/org-name.pipe';
import { NationalityService } from '../../../services/nationality.services';
import { LookupService } from '../../../services/lookup.service';
import { LookupOption } from '../../../shared/lookups/lookups.types';

import { Subscription } from 'rxjs';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    OrgNamePipe,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  ////  من اجل فك الارتباطات
  private destroy$ = new Subject<void>();
///

   private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private nationalityService = inject(NationalityService);
  private store = inject(LocalEmployeesService);
  private router = inject(Router);
  private lookup = inject(LookupService); // ← قبل استخدامه
  private route = inject(ActivatedRoute);
  // —— ثوابت الحالة —— //
  private readonly STORAGE_KEY = 'emp_search_filters_v1';
  private readonly TABLE_STATE_KEY = 'emp_search_table_v1';
  ALL = '__ALL__';

  // —— مراجع الجدول —— //
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // —— مصادر البيانات —— //
  orgTree: OrgNode[] = DEPARTMENTS;
  dataSource = new MatTableDataSource<Employee>([]);
  nationalities: string[] = [];
  private sub?: Subscription;

  // —— لوائح عبر LookupService —— //
    genders$ = this.lookup.genders$;

  jobTitleOpts: LookupOption[] = [];
  educationOpts: LookupOption[] = [];
  bloodTypeOpts: LookupOption[] = [];
  gendersOpts: LookupOption[] = []; // لاستخدام اللابل في الـ chips
 jobAttributeOpts: LookupOption[] = [];
 jobCategoryOpts: LookupOption[]=[]; 
 decisionAttributeOpts: LookupOption[]=[];
  appointmentTypesOpts: LookupOption[]=[];


 

  // قيم نصّية مستخلصة من الخيارات (لمنطق الفلاتر)
  private jobTitleValues: string[] = [];
  private educationValues: string[] = [];
  private bloodTypeValues: string[] = [];
  private jobAttributeValues: string[] = [];
  private jobCategoryValues: string[]=[];
  private decisionAttributeValues: string[]=[];
  private appointmentTypeValues: string[]=[];




  // مجمّع خيارات الفلاتر المتعددة (يُحدّث لاحقًا)
  private OPTIONS: Record<string, string[]> = {
    jobTitle: this.jobTitleValues,
    education: this.educationValues,
    bloodType: this.bloodTypeValues,
    nationality: this.nationalities,
      jobAttribute: this.jobAttributeValues, 
      jobCategory: this.jobCategoryValues ,
      decisionAttribute: this.decisionAttributeValues,
      appointmentType: this.appointmentTypeValues,

  };


  

  // —— نموذج الفلاتر —— //
  showFilters = true;
  filtersForm!: FormGroup;

  // —— إدارة الأعمدة الديناميكية —— //
  // columnPicker!: FormControl<ColId[]>;
columnPicker = new FormControl<ColId[]>([]);

  
  allColumns: ColumnDef[] = [
    { id: 'index',            label: '#',                 selectable: false, always: true },
    { id: 'fullName',         label: 'الاسم الكامل',      selectable: true,  always: true },

    { id: 'jobTitle',         label: 'المسمى الوظيفي',    selectable: true,  default: true },
    { id: 'bloodType',        label: 'زمرة الدم',         selectable: true },
    { id: 'education',        label: 'التحصيل العلمي',    selectable: true,  default: true },
    { id: 'jobAttribute', label: 'الصفة الوظيفية', selectable: true },
    { id: 'jobCategory', label: 'الفئة الوظيفية', selectable: true },
    { id: 'decisionAttribute', label: 'صفة التعيين', selectable: true },
    { id: 'appointmentType', label: 'نوع التعيين', selectable: true },

    { id: 'placeCode',        label: 'مكان المباشرة',     selectable: true },
    { id: 'dateActionWork',   label: 'تاريخ المباشرة',    selectable: true },
    { id: 'workDate',         label: 'تاريخ التعيين',     selectable: true },
    { id: 'birthDate',        label: 'تاريخ الميلاد',     selectable: true },
    { id: 'actions',          label: 'إجراءات',           selectable: false, always: true },
  ];

  // خريطة سريعة: id -> label (O(1))
private idToLabel = new Map<ColId, string>(
  this.allColumns.map(c => [c.id, c.label] as [ColId, string])
);


  // —— واجهة —— //
  activeChips: Array<{ key: string; label: string; value: string }> = [];
  flatPlaces: Array<{ code: string; name: string }> = [];

  // —— DI —— //

  // —— أدوات مساعدة —— //
  goHome() { this.router.navigate(['']); }
  today = () => new Date();

  // columnLabel(col: ColId): string {
  //   return this.allColumns.find(c => c.id === col)?.label ?? col;
  // }


  columnLabel = (id: ColId) => this.idToLabel.get(id) ?? '';



  formatDate(v?: string | Date | null): string {
    if (!v) return '—';
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d.getTime())) return String(v);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }


  

  // ====== Lifecycle ====== //
  ngOnInit(): void {
  // 1) أعمدة ديناميكية
  this.columnPicker = this.fb.nonNullable.control<ColId[]>([]);

  // 2) نموذج الفلاتر
  this.filtersForm = this.fb.group({
    gender: [''],
    jobTitle: [[this.ALL] as string[]],
    education: [[this.ALL] as string[]],
    bloodType: [[this.ALL] as string[]],
    placeCode: [[this.ALL] as string[]],
    nationalities: [[] as string[]],
    jobAttribute: [[this.ALL] as string[]],  
    jobCategory:[[this.ALL]as string[]],
    decisionAttribute:[[this.ALL]as string[]],
    appointmentType:[[this.ALL]as string[]],

    birthFrom: [null as Date | null],
    birthTo:   [null as Date | null],
    workFrom:  [null as Date | null],
    workTo:    [null as Date | null],
    actionFrom:[null as Date | null],
    actionTo:  [null as Date | null],
    salaryFrom:[null as number | null],
    salaryTo:  [null as number | null],
    q: [''],
  });

  // 3) بيانات الجدول + فلتر
  this.dataSource.data = this.store.list();
  this.dataSource.filterPredicate = (row, _f) => this.applyPredicate(row);

  // 4) تسطيح الشجرة
  this.flattenOrgs(this.orgTree, this.flatPlaces);

  // 5) تحميل حالة الفلاتر المحفوظة
  const saved = this.loadFilters();
  if (saved) {
    if (!Array.isArray(saved.education) || !saved.education.length) {
      saved.education = [this.ALL];
    }
    this.filtersForm.patchValue(saved, { emitEvent: false });
  }
  this.refreshActiveChips();
  this.triggerFilter();

  // 6) حالة الأعمدة المحفوظة
  const savedColsRaw = localStorage.getItem(this.TABLE_STATE_KEY);
  if (savedColsRaw) {
    try {
      const savedCols = JSON.parse(savedColsRaw) as ColId[];
      this.columnPicker.setValue(savedCols, { emitEvent: false });
    } catch {}
  } else {
    const defaults = this.allColumns
      .filter(c => c.selectable && c.default)
      .map(c => c.id as ColId);
    this.columnPicker.setValue(defaults, { emitEvent: false });
  }

  // ====== الاشتراكات (كلها عبر takeUntil) ======
  this.filtersForm.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.saveFilters();
      this.refreshActiveChips();
      this.triggerFilter();
    });

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

  // الجنسيات (strings)
  this.nationalityService.nationalities$
    .pipe(takeUntil(this.destroy$))
    .subscribe(list => {
      this.nationalities = list;
      this.OPTIONS['nationality'] = list;
      this.cdr.markForCheck();
    });

    this.lookup.JOBATTRIBUTE_DEFAULTES$
  .pipe(takeUntil(this.destroy$))
  .subscribe(opts => {
    this.jobAttributeOpts = opts;
    this.jobAttributeValues = opts.map(o => o.value);
    this.OPTIONS['jobAttribute'] = this.jobAttributeValues;
    this.syncControlWithOptions('jobAttribute', this.jobAttributeValues); // تنظيف أي قيم قديمة
    this.cdr.markForCheck();
  }); 


   this.lookup.JOBCATEGORY_DEFAULTES$
  .pipe(takeUntil(this.destroy$))
  .subscribe(opts => {
    this.jobCategoryOpts = opts;
    this.jobCategoryValues = opts.map(o => o.value);
    this.OPTIONS['jobCategory'] = this.jobCategoryValues;
    this.syncControlWithOptions('jobCategory', this.jobCategoryValues); // تنظيف أي قيم قديمة
    this.cdr.markForCheck();
  });

  
   this.lookup.decisionAttribute_DEFAULTES$
  .pipe(takeUntil(this.destroy$))
  .subscribe(opts => {
    this.decisionAttributeOpts = opts;
    this.decisionAttributeValues = opts.map(o => o.value);
    this.OPTIONS['decisionAttribute'] = this.decisionAttributeValues;
    this.syncControlWithOptions('decisionAttribute', this.decisionAttributeValues); // تنظيف أي قيم قديمة
    this.cdr.markForCheck();
  });
    this.lookup.appointmentTypes_DEFAULTES$
  .pipe(takeUntil(this.destroy$))
  .subscribe(opts => {
    this.appointmentTypesOpts = opts;
    this.appointmentTypeValues = opts.map(o => o.value);
    this.OPTIONS['appointmentType'] = this.appointmentTypeValues;
    this.syncControlWithOptions('appointmentType', this.appointmentTypeValues); // تنظيف أي قيم قديمة
    this.cdr.markForCheck();
  });

}


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // فرز زمني للأعمدة التاريخية
    this.dataSource.sortingDataAccessor = (row: Employee, column: string) => {
      switch (column) {
        case 'birthDate':       return row.birthDate      ? row.birthDate.getTime()      : 0;
        case 'workDate':        return row.workDate       ? row.workDate.getTime()       : 0;
        case 'dateActionWork':  return row.dateActionWork ? row.dateActionWork.getTime() : 0;
        case 'fullName':        return `${row.firstName ?? ''} ${row.fatherName ?? ''} ${row.lastName ?? ''}`.trim();
        default:                return (row as any)[column] ?? '';
      }
    };
  }

  ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}


private eduValueMatches(rowEdu: string, selected: string[]): boolean {
  if (!selected.length) return true;
  // تطابق مباشر على value
  if (selected.includes(rowEdu)) return true;
  // تطابق احتياطي إذا كانت البيانات القديمة تُخزن label
  const byLabel = this.educationOpts.find(o => o.label === rowEdu)?.value;
  return byLabel ? selected.includes(byLabel) : false;
}


  // ====== منطق الفلاتر ====== //
  applyGlobal(q: string) {
    this.filtersForm.patchValue({ q }, { emitEvent: true });
  }

  private triggerFilter() {
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

  private applyPredicate(e: Employee): boolean {
    const f = this.filtersForm.value;

    // 1) البحث العام
    const q = this.normalize(f.q);
    if (q) {
      const hay = [
        e.firstName, e.fatherName, e.lastName, e.motherName,
        e.jobTitle, e.paperFileNumber,
        e.nationalNumber, e.idNumber,
        e.permenentAddress, e.residence,
        e.placeActionWork,
        this.ymd(e.birthDate), this.ymd(e.workDate), this.ymd(e.dateActionWork),
      ].map(v => this.normalize(v)).join(' ');
      if (!hay.includes(q)) return false;
    }

    // 2) فلاتر القوائم المتعددة
    const eduSel: string[] = (f.education ?? []) as string[];
    const eduAll = !eduSel.length || eduSel.includes(this.ALL);
    // if (!eduAll) {
    //   const rowEdu = (e.education ?? '').toString();
    //   if (!eduSel.includes(rowEdu)) return false;
    // }
    if (!eduAll) {
  const rowEdu = (e.education ?? '').toString();
  if (!this.eduValueMatches(rowEdu, eduSel)) return false;
}


    const bloodSel: string[] = (f.bloodType ?? []) as string[];
    const bloodAll = !bloodSel.length || bloodSel.includes(this.ALL);
    if (!bloodAll) {
      const rowBlood = (e.bloodType ?? '').toString();
      if (!bloodSel.includes(rowBlood)) return false;
    }

    const jobSel: string[] = (f.jobTitle ?? []) as string[];
    const jobAll = !jobSel.length || jobSel.includes(this.ALL);
    if (!jobAll) {
      const rowJob = (e.jobTitle ?? '').toString();
      if (!jobSel.includes(rowJob)) return false;
    }  
    const jobCat: string[] = (f.jobCategory ?? []) as string[];
    const jobcatAll = !jobCat.length || jobCat.includes(this.ALL);
    if (!jobcatAll) {
      const rowcatJob = (e.jobCategory ?? '').toString();
      if (!jobCat.includes(rowcatJob)) return false;
    }
    // صفة التعيين (decisionAttribute)
{
  const sel: string[] = (f.decisionAttribute ?? []) as string[];
  const isAll = !sel.length || sel.includes(this.ALL);
  if (!isAll) {
    // قد تكون القيمة في أماكن مختلفة أو مخزنة كـ label في بيانات قديمة
    const raw = (e as any).decisionAttribute ?? (e as any)?.workdetails?.decisionAttribute ?? '';
    const norm = raw?.toString() ?? '';
    const rowAsValue =
      this.decisionAttributeOpts.find(o => o.value === norm)?.value ??
      this.decisionAttributeOpts.find(o => o.label === norm)?.value ?? // دعم مخزن كـ label
      norm;
    if (!sel.includes(rowAsValue)) return false;
  }
}

// نوع التعيين (appointmentType)
{
  const sel: string[] = (f.appointmentType ?? []) as string[];
  const isAll = !sel.length || sel.includes(this.ALL);
  if (!isAll) {
    const raw = (e as any).appointmentType ?? (e as any)?.workdetails?.appointmentType ?? '';
    const norm = raw?.toString() ?? '';
    const rowAsValue =
      this.appointmentTypesOpts.find(o => o.value === norm)?.value ??
      this.appointmentTypesOpts.find(o => o.label === norm)?.value ??
      norm;
    if (!sel.includes(rowAsValue)) return false;
  }
}


    const placeSel: string[] = (f.placeCode ?? []) as string[];
    const placeAll = !placeSel.length || placeSel.includes(this.ALL);
    if (!placeAll) {
      const row = (e.placeActionWork ?? '').toString();
      const parts = row.split('|').map(s => s.trim()).filter(Boolean);
      if (!parts.length) return false;
      const hasIntersection = placeSel.some(code => parts.includes(code));
      if (!hasIntersection) return false;
    } 
    //من اجل الصفة الوظيفية
    const attrSel: string[] = (f.jobAttribute ?? []) as string[];
const attrAll = !attrSel.length || attrSel.includes(this.ALL);
if (!attrAll) {
  const rowAttr = (e as any).jobAttribute ?? (e as any)?.workdetails?.jobAttribute ?? '';


  // دعم بيانات قديمة قد تكون label:
  const normalized = rowAttr?.toString() ?? '';
  const rowAsValue =
    this.jobAttributeOpts.find(o => o.value === normalized)?.value ??
    this.jobAttributeOpts.find(o => o.label === normalized)?.value ??
    normalized;

  if (!attrSel.includes(rowAsValue)) return false;
}


    // 3) فلاتر مفردة
    if (f.gender && e.gender !== f.gender) return false;
    if (!this.nationalityMatches(e.nationality as any, f.nationalities ?? [])) return false;

    // 4) نطاقات التواريخ
    if (!this.inRangeDate(e.birthDate, f.birthFrom, f.birthTo)) return false;
    if (!this.inRangeDate(e.workDate, f.workFrom, f.workTo)) return false;
    if (!this.inRangeDate(e.dateActionWork, f.actionFrom, f.actionTo)) return false;

    // 5) نطاق الراتب
    if (!this.inRangeNumber(e.startingSalary, f.salaryFrom, f.salaryTo)) return false;

    return true;
  }
trackByValue = (_: number, it: { value: string }) => it.value;

  // ====== إدارة الشيبس ====== //
  // private labelOf(opts: LookupOption[], value: string): string {
  //   return opts.find(o => o.value === value)?.label ?? value;
  // }

 labelOf = (opts: LookupOption[], value: string): string =>
  opts.find(o => o.value === value)?.label ?? value;



  private refreshActiveChips() {
    const f = this.filtersForm.value;
    const chips: Array<{ key: string; label: string; value: string }> = [];

    if (f.q) chips.push({ key: 'q', label: 'بحث', value: f.q! });

    if (Array.isArray(f.education) && f.education.length) {
      const vals = f.education.includes(this.ALL) ? ['الكل'] :
        f.education.map((v: string) => this.labelOf(this.educationOpts, v));
      chips.push({ key: 'education', label: 'التحصيل', value: vals.join('، ') });
    }

    if (Array.isArray(f.bloodType) && f.bloodType.length) {
      const vals = f.bloodType.includes(this.ALL) ? ['الكل'] :
        f.bloodType.map((v: string) => this.labelOf(this.bloodTypeOpts, v));
      chips.push({ key: 'bloodType', label: 'زمرة', value: vals.join('، ') });
    }

    if (Array.isArray(f.jobTitle) && f.jobTitle.length) {
      const vals = f.jobTitle.includes(this.ALL) ? ['الكل'] :
        f.jobTitle.map((v: string) => this.labelOf(this.jobTitleOpts, v));
      chips.push({ key: 'jobTitle', label: 'المسمى', value: vals.join('، ') });
    }

    if (Array.isArray(f.placeCode) && f.placeCode.length) {
      const vals = f.placeCode.includes(this.ALL)
        ? ['الكل']
        : f.placeCode.map((c: string) => this.findNameByCode(c) ?? c);
      chips.push({ key: 'placeCode', label: 'مكان المباشرة', value: vals.join('، ') });
    }

    if (f.gender) {
      const label = this.labelOf(this.gendersOpts, f.gender);
      chips.push({ key: 'gender', label: 'الجنس', value: label });
    }

    if (f.nationalities?.length) {
      chips.push({ key: 'nationalities', label: 'الجنسية', value: f.nationalities!.join('، ') });
    }
 // من  اجل الاضافة في الشريط العلوي 
    if (Array.isArray(f.jobAttribute) && f.jobAttribute.length) {
  const vals = f.jobAttribute.includes(this.ALL)
    ? ['الكل']
    : f.jobAttribute.map((v: string) => this.labelOf(this.jobAttributeOpts, v));
  chips.push({ key: 'jobAttribute', label: 'الصفة الوظيفية', value: vals.join('، ') });
}  


  if (Array.isArray(f.jobCategory) && f.jobCategory.length) {
  const vals = f.jobCategory.includes(this.ALL)
    ? ['الكل']
    : f.jobCategory.map((v: string) => this.labelOf(this.jobCategoryOpts, v));
  chips.push({ key: 'jobCategory', label: 'الفئة الوظيفية', value: vals.join('، ') });
}

  if (Array.isArray(f.decisionAttribute) && f.decisionAttribute.length) {
  const vals = f.decisionAttribute.includes(this.ALL)
    ? ['الكل']
    : f.decisionAttribute.map((v: string) => this.labelOf(this.decisionAttributeOpts, v));
  chips.push({ key: 'decisionAttribute', label: 'صفة التعيين', value: vals.join('، ') });
}

    if (Array.isArray(f.appointmentType) && f.appointmentType.length) {
  const vals = f.appointmentType.includes(this.ALL)
    ? ['الكل']
    : f.appointmentType.map((v: string) => this.labelOf(this.appointmentTypesOpts, v));
  chips.push({ key: 'appointmentType', label: 'نوع التعيين', value: vals.join('، ') });
}

    if (f.birthFrom) chips.push({ key: 'birthFrom', label: 'ميلاد من', value: f.birthFrom!.toLocaleDateString('ar-SY') });
    if (f.birthTo) chips.push({ key: 'birthTo', label: 'ميلاد إلى', value: f.birthTo!.toLocaleDateString('ar-SY') });
    if (f.workFrom) chips.push({ key: 'workFrom', label: 'تعيين من', value: f.workFrom!.toLocaleDateString('ar-SY') });
    if (f.workTo) chips.push({ key: 'workTo', label: 'تعيين إلى', value: f.workTo!.toLocaleDateString('ar-SY') });
    if (f.actionFrom) chips.push({ key: 'actionFrom', label: 'مباشرة من', value: f.actionFrom!.toLocaleDateString('ar-SY') });
    if (f.actionTo) chips.push({ key: 'actionTo', label: 'مباشرة إلى', value: f.actionTo!.toLocaleDateString('ar-SY') });

    if (f.salaryFrom != null) chips.push({ key: 'salaryFrom', label: 'راتب من', value: String(f.salaryFrom) });
    if (f.salaryTo != null) chips.push({ key: 'salaryTo', label: 'راتب إلى', value: String(f.salaryTo) });

    this.activeChips = chips;
  }
// من اجل التنظيف بعد التعديل
  private syncControlWithOptions(
  controlName: keyof typeof this.OPTIONS,
  validValues: string[]
) {
  const current = (this.filtersForm.value[controlName] as string[] | null) ?? [];
  if (!current.length) return;

  const ALL = this.ALL;
  if (current.includes(ALL)) return; // "الكل" لا يحتاج تنظيف

  const filtered = current.filter(v => validValues.includes(v));
  if (filtered.length !== current.length) {
    this.filtersForm.patchValue({ [controlName]: (filtered.length ? filtered : [ALL]) });
  }
}


  removeChip(c: { key: string }) {
    const patch: any = { [c.key]: Array.isArray((this.filtersForm.value as any)[c.key]) ? [] : '' };
    if (c.key === 'education') patch[c.key] = [];
    if (c.key === 'bloodType') patch[c.key] = [];
    if (c.key === 'placeCode') patch[c.key] = [];
    if (['birthFrom', 'birthTo', 'workFrom', 'workTo', 'actionFrom', 'actionTo'].includes(c.key)) patch[c.key] = null;
    if (['salaryFrom', 'salaryTo'].includes(c.key)) patch[c.key] = null;
    if (c.key === 'nationalities') patch[c.key] = [];
    this.filtersForm.patchValue(patch);
      if (c.key === 'jobAttribute') patch[c.key] = [];  

  }

  resetFilters() {
    this.filtersForm.reset({
      gender: '',
      jobTitle: [this.ALL],
      education: [this.ALL],
      jobAttribute: [this.ALL],
      bloodType: [this.ALL],
      placeCode: [this.ALL],
      nationalities: [],
      birthFrom: null, birthTo: null,
      workFrom: null, workTo: null,
      actionFrom: null, actionTo: null,
      salaryFrom: null, salaryTo: null,
      q: '',
    });
    localStorage.removeItem(this.STORAGE_KEY);
    this.triggerFilter();
  }

  onMultiSelectChange(controlName: keyof typeof this.OPTIONS) {
    const ALL = this.ALL;
    let selected = (this.filtersForm.value[controlName] as string[] | null) ?? [];
    if (selected.length === 1 && selected[0] === ALL) {
      // ALL فقط ⇒ لا فلترة
    } else if (selected.includes(ALL) && selected.length > 1) {
      selected = selected.filter(v => v !== ALL);
    }
    this.filtersForm.patchValue({ [controlName]: selected }, { emitEvent: false });
    this.saveFilters();
    this.triggerFilter();
  }

  onOptionToggle(controlName: keyof typeof this.OPTIONS, e: MatOptionSelectionChange, value: string) {
    if (!e.isUserInput) return;
    const ALL = this.ALL;
    let selected: string[] = [...((this.filtersForm.value[controlName] as string[]) ?? [])];

    if (value === ALL) {
      if (e.source.selected) {
        selected = [ALL]; // لا فلترة
        // أو: selected = [...(this.OPTIONS[controlName] ?? [])]; // لاختيار جميع العناصر فعليًا
      } else {
        selected = [];
      }
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

  // ====== Helpers ====== //
  private flattenOrgs(nodes: OrgNode[], acc: Array<{ code: string; name: string }>) {
    for (const n of nodes) {
      if (n.code) acc.push({ code: n.code, name: n.name });
      if (n.subs?.length) this.flattenOrgs(n.subs, acc);
    }
  }

  private findNameByCode(code: string): string | null {
    const stack: OrgNode[] = [...this.orgTree];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.code === code) return n.name;
      if (n.subs?.length) stack.push(...n.subs);
    }
    return null;
  }

  browseEmployee(emp: Employee) {
    this.router.navigate(['/employees/browse', emp.id]);
  }

  // ====== تخزين/تحميل حالة الفلاتر ====== //
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
    };
  }

  // ====== أعمدة الجدول الديناميكية ====== //
  get displayedColumns(): ColId[] {
    const leftPinned: ColId[] = ['index'];
    const rightPinned: ColId[] = ['actions'];

    const always = this.allColumns.filter(c => c.always).map(c => c.id);
    const selected = (this.columnPicker.value ?? []) as ColId[];

    const fallback = this.allColumns
      .filter(c => c.selectable && c.default)
      .map(c => c.id);

    const middle = (selected.length ? selected : fallback)
      .filter(id => !leftPinned.includes(id) && !rightPinned.includes(id));

    const alwaysMiddle = always.filter(id => !leftPinned.includes(id) && !rightPinned.includes(id));

    return [...leftPinned, ...alwaysMiddle, ...middle, ...rightPinned]
      .filter((v, i, arr) => arr.indexOf(v) === i);
  }

  selectAllColumns() {
    const allSelectable = this.allColumns
      .filter(c => c.selectable)
      .map(c => c.id);
    this.columnPicker.setValue(allSelectable);
  }

  clearColumns() {
    this.columnPicker.setValue([]);
  }
}

// ====== Types خارج الكلاس ====== //
type ColId =
  | 'index'
  | 'fullName'
  | 'jobTitle'
  | 'bloodType'
  | 'education'
  | 'placeCode'
  | 'dateActionWork'
  | 'workDate'
  | 'birthDate'
  | 'actions'
  | 'jobAttribute'
  |'jobCategory'
  |'decisionAttribute'
  |'appointmentType'
  
  ;


interface ColumnDef {
  id: ColId;
  label: string;
  selectable: boolean;
  always?: boolean;
  default?: boolean;
}

