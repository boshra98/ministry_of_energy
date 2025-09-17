


import { Component, inject, ViewChild } from '@angular/core';
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
import { FormBuilder, FormGroup ,FormControl } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import { LocalEmployeesService, Employee } from '../../../services/local-employees.service';
import { DEPARTMENTS, OrgNode } from '../../../models/department';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from "@angular/material/chips";          // ✅
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionSelectionChange } from '@angular/material/core';
import { OrgNamePipe } from "../../../pipes/org-name.pipe";

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
    MatDatepickerModule, // 
    MatNativeDateModule,
    OrgNamePipe
],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})

export class SearchComponent {

columnLabel(col: ColId): string {
  return this.allColumns.find(c => c.id === col)?.label ?? col;
}


  formatDate(v?: string | Date | null): string {
  if (!v) return '—';

  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) return String(v);

  const day   = d.getDate().toString().padStart(2, '0');       // يوم برقمين
  const month = (d.getMonth() + 1).toString().padStart(2, '0'); // شهر برقمين
  const year  = d.getFullYear();

  return `${day}/${month}/${year}`;
}



// goHome() {
// throw new Error('Method not implemented.');
// }



private readonly STORAGE_KEY = 'emp_search_filters_v1';
private readonly TABLE_STATE_KEY = 'emp_search_table_v1';


goHome() {
    this.router.navigate(['']);
}
  today = () => new Date();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // بيانات ثابتة للواجهات
  genders = [
    { value: 'male',   label: 'ذكر' },
    { value: 'female', label: 'أنثى' },
  ];
  ALL = '__ALL__';

  jobTitles: string[] = ['مدرّس', 'محاسب', 'سكرتير', 'مبرمج' ,'مدير'];
  educations: string[] = ['ابتدائي','اعدادي','ثانوي','بكالوريوس','ماستر','دكتوراه'];
  bloodTypes: string[] = ['A-','A+','B-','B+','AB-','AB+','O+','O-'];
  nationalities: string[] = [
  'سوري','فلسطيني سوري','لبناني','اردني','فلسطيني أردني','مصري',
  'فلسطيني لبناني','حاصل على الجنسية التركية','حاصل على الجنسية الخليجية',
  'حاصل على الجنسية الأوروبية','حاصل على الجنسية الاميركية'
];
private OPTIONS: Record<string, string[]> = {
  jobTitle: this.jobTitles,
  education: this.educations,
  bloodType: this.bloodTypes,
  nationality: this.nationalities,
};
showFilters = true;
filtersForm!: FormGroup;

  

  orgTree: OrgNode[] = DEPARTMENTS;
  dataSource = new MatTableDataSource<Employee>([]);
  activeChips: Array<{key: string; label: string; value: string}> = [];
  // displayedColumns: string[] = ['index', 'fullName', 'jobTitle', 'actions'];
    private route = inject(ActivatedRoute);

  constructor(
  private fb: FormBuilder,

  private store: LocalEmployeesService,
  private router: Router
) {}

//لجلب المسار الوظيفي
flatPlaces: Array<{code: string; name: string}> = [];

private flattenOrgs(nodes: OrgNode[], acc: Array<{code:string; name:string}>) {
  for (const n of nodes) {
    if (n.code) acc.push({ code: n.code, name: n.name });
    if (n.subs?.length) this.flattenOrgs(n.subs, acc);
  }
}

columnPicker!: FormControl<ColId[]>;


  ngOnInit(): void {
   this.columnPicker = this.fb.nonNullable.control<ColId[]>([]);
   const id = this.route.snapshot.paramMap.get('id');
    // if (!id) { this.notFound = true; this.loading = false; return; }

    const list = this.store.list();
   
    this.employee = list.find(e => e.id === id);

// this.columnPicker = this.fb.control<ColId[]>([]);


    this.filtersForm = this.fb.group({
      
    gender: [''],
    jobTitle:[[this.ALL] as string[]],
    
    // jobTitle: [''],
    // education: [''],
    education: [[this.ALL] as string[]],   

    // bloodType: [''],
    bloodType: [[this.ALL] as string[]],
    placeCode: [[this.ALL] as string[]],
    nationalities: [[] as string[]],
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

    const data = this.store.list();
    this.dataSource.data = data;

    this.dataSource.filterPredicate = (row, _filterStr) => this.applyPredicate(row);
    this.flattenOrgs(this.orgTree, this.flatPlaces);

//  حمّل الفلاتر المحفوظة إن وُجدت
  const saved = this.loadFilters();
  if (saved) {
    // لو لم توجد قيمة محفوظة للتحصيل، لا تغيّر القيمة الافتراضية
    if (!Array.isArray(saved.education) || !saved.education.length) {
      saved.education = [this.ALL];
    }
    this.filtersForm.patchValue(saved, { emitEvent: false });
    this.refreshActiveChips();
    this.triggerFilter();
  } else {
    // أول تحميل بدون حالة محفوظة
    this.refreshActiveChips();
    this.triggerFilter();
  }

  // كل تغيير نحفظه ونفلتر
  this.filtersForm.valueChanges.subscribe(() => {
    this.saveFilters();
    this.refreshActiveChips();
    this.triggerFilter();
  });
  
// من اجل جعل الcolumns  ديناميكي 
  const savedColsRaw = localStorage.getItem(this.TABLE_STATE_KEY);
if (savedColsRaw) {
  try {
    const savedCols = JSON.parse(savedColsRaw) as ColId[];
    this.columnPicker.setValue(savedCols, { emitEvent: false });
  } catch { 

   }
} else {
  const defaults = this.allColumns
    .filter(c => c.selectable && c.default)
    .map(c => c.id as ColId);
  this.columnPicker.setValue(defaults, { emitEvent: false });
}

this.columnPicker.valueChanges.subscribe(cols => {
  localStorage.setItem(this.TABLE_STATE_KEY, JSON.stringify(cols ?? []));
});


}
   
  
private saveFilters() {
  const v = this.filtersForm.value;
  // حول التواريخ إلى ISO لتخزين نظيف
  const toISO = (d: Date | null | undefined) => d ? new Date(d).toISOString() : null;
  const payload = {
    ...v,
    birthFrom: toISO(v.birthFrom),
    birthTo:   toISO(v.birthTo),
    workFrom:  toISO(v.workFrom),
    workTo:    toISO(v.workTo),
    actionFrom:toISO(v.actionFrom),
    actionTo:  toISO(v.actionTo),
  };
  localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
}

private loadFilters(): any | null {
  const raw = localStorage.getItem(this.STORAGE_KEY);
  if (!raw) return null;
  const p = JSON.parse(raw);
  const toDate = (s: string | null) => s ? new Date(s) : null;
  return {
    ...p,
    birthFrom:  toDate(p.birthFrom),
    birthTo:    toDate(p.birthTo),
    workFrom:   toDate(p.workFrom),
    workTo:     toDate(p.workTo),
    actionFrom: toDate(p.actionFrom),
    actionTo:   toDate(p.actionTo),
  };
}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

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
    const x = new Date(d); x.setHours(0,0,0,0); return x;
  }
  private inRangeDate(value: any, from?: Date | null, to?: Date | null): boolean {
    if (!from && !to) return true;
    if (!value) return false;
    const d = new Date(value);
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
    if (to   != null && n > to)   return false;
    return true;
  }
  // private placeMatches(rowCode: string | null | undefined, selectedCode: string): boolean {
  //   if (!selectedCode) return true;
  //   const raw = (rowCode ?? '').toString();
  //   if (!raw) return false;
  //   const parts = raw.split('|').map(s => s.trim()).filter(Boolean);
  //   return parts.includes(selectedCode);
  // }
  private nationalityMatches(rowNat: any, selected: string[]): boolean {
    if (!selected?.length) return true;
    const arr = Array.isArray(rowNat)
      ? rowNat as string[]
      : (typeof rowNat === 'string' ? rowNat.split(/[,\u060C]/).map(s => s.trim()) : []);
    if (!arr.length) return false;
    return selected.some(s => arr.includes(s));
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
        e.placeActionWork
      ].map(v => this.normalize(v)).join(' ');
      if (!hay.includes(q)) return false;
    }

  const eduSel: string[] = (f.education ?? []) as string[];
  const eduAll = !eduSel.length || eduSel.includes(this.ALL);
  if (!eduAll) {
    const rowEdu = (e.education ?? '').toString();
    if (!eduSel.includes(rowEdu)) return false;
  }

  // زمرة الدم
const bloodSel: string[] = (f.bloodType ?? []) as string[];
const bloodAll = !bloodSel.length || bloodSel.includes(this.ALL);
if (!bloodAll) {                                  // ⬅️ كان !bloodSel
  const rowBlood = (e.bloodType ?? '').toString();
  if (!bloodSel.includes(rowBlood)) return false;
}

  const jobSel: string[] = (f.jobTitle ?? []) as string[];
  const jobAll = !jobSel.length || jobSel.includes(this.ALL);
  if (!jobAll) {
    const rowJob = (e.jobTitle ?? '').toString();
    if (!jobSel.includes(rowJob)) return false;
  }
const placeSel: string[] = (f.placeCode ?? []) as string[];
  const placeAll = !placeSel.length || placeSel.includes(this.ALL);
  if (!placeAll) {
    const row = (e.placeActionWork ?? '').toString();
    const parts = row.split('|').map(s => s.trim()).filter(Boolean); // ['D01','D02',...]
    if (!parts.length) return false;

    // نحتاج أي تقاطع بين اختيارات المستخدم وقيم السطر
    const hasIntersection = placeSel.some(code => parts.includes(code));
    if (!hasIntersection) return false;
  }
    // 2) فلاتر القوائم
    if (f.gender    && e.gender    !== f.gender)    return false;
    // if (f.jobTitle  && e.jobTitle  !== f.jobTitle)  return false;
    // if (f.education && e.education !== f.education) return false;
    // if (f.bloodType && e.bloodType !== f.bloodType) return false;
    // if (f.placeCode && !this.placeMatches(e.placeActionWork, f.placeCode)) return false;
    if (!this.nationalityMatches(e.nationality as any, f.nationalities ?? [])) return false;

    // 3) نطاقات التواريخ
    if (!this.inRangeDate(e.birthDate,     f.birthFrom,  f.birthTo))  return false;
    if (!this.inRangeDate(e.workDate,      f.workFrom,   f.workTo))   return false;
    if (!this.inRangeDate(e.dateActionWork,f.actionFrom, f.actionTo)) return false;

    // 4) نطاق الراتب
    if (!this.inRangeNumber(e.startingSalary, f.salaryFrom, f.salaryTo)) return false;

    return true;
  }

  private refreshActiveChips() {
    const f = this.filtersForm.value;
    const chips: Array<{key:string; label:string; value:string}> = [];


    if (f.q) chips.push({ key:'q', label:'بحث', value: f.q! });

    if (Array.isArray(f.education) && f.education.length) {
  const vals = f.education.includes(this.ALL)
    ? ['الكل']
    : f.education;
  chips.push({ key:'education', label:'التحصيل', value: vals.join('، ') });
} 

if (Array.isArray(f.bloodType) && f.bloodType.length) {
  const vals = f.bloodType.includes(this.ALL)
    ? ['الكل']
    : f.bloodType;
  chips.push({ key:'bloodType', label:'زمرة', value: vals.join('، ') });
}

if (Array.isArray(f.jobTitle) && f.jobTitle.length) {
  const vals = f.jobTitle.includes(this.ALL)
    ? ['الكل']
    : f.jobTitle;
  chips.push({ key:'jobTitle', label:'المسمى', value: vals.join('، ') });
}
if (Array.isArray(f.placeCode) && f.placeCode.length) {
  const vals = f.placeCode.includes(this.ALL)
    ? ['الكل']
    : f.placeCode.map((c: string) => this.findNameByCode(c) ?? c);
  chips.push({ key:'placeCode', label:'مكان المباشرة', value: vals.join('، ') });
}


    if (f.gender) {
      const label = this.genders.find(g => g.value === f.gender)?.label ?? f.gender!;
      chips.push({ key:'gender', label:'الجنس', value: label });
    }
    // if (f.jobTitle)  chips.push({ key:'jobTitle',  label:'المسمى',   value: f.jobTitle! });
    // if (f.education) chips.push({ key:'education', label:'التحصيل',  value: f.education! });
    // if (f.bloodType) chips.push({ key:'bloodType', label:'زمرة',     value: f.bloodType! });

    // if (f.placeCode) {
    //   const name = this.findNameByCode(f.placeCode!) ?? f.placeCode!;
    //   chips.push({ key:'placeCode', label:'مكان المباشرة', value: name });
    // }
    if (f.nationalities?.length) chips.push({ key:'nationalities', label:'الجنسية', value: f.nationalities!.join('، ') });

    if (f.birthFrom) chips.push({ key:'birthFrom', label:'ميلاد من', value: f.birthFrom!.toLocaleDateString('ar-SY') });
    if (f.birthTo)   chips.push({ key:'birthTo',   label:'ميلاد إلى', value: f.birthTo!.toLocaleDateString('ar-SY') });
    if (f.workFrom)  chips.push({ key:'workFrom',  label:'تعيين من', value: f.workFrom!.toLocaleDateString('ar-SY') });
    if (f.workTo)    chips.push({ key:'workTo',    label:'تعيين إلى', value: f.workTo!.toLocaleDateString('ar-SY') });
    if (f.actionFrom)chips.push({ key:'actionFrom',label:'مباشرة من', value: f.actionFrom!.toLocaleDateString('ar-SY') });
    if (f.actionTo)  chips.push({ key:'actionTo',  label:'مباشرة إلى', value: f.actionTo!.toLocaleDateString('ar-SY') });

    if (f.salaryFrom!=null) chips.push({ key:'salaryFrom', label:'راتب من', value: String(f.salaryFrom) });
    if (f.salaryTo!=null)   chips.push({ key:'salaryTo',   label:'راتب إلى', value: String(f.salaryTo) });

    this.activeChips = chips;
  }

  removeChip(c: {key:string}) {
    const patch: any = { [c.key]: Array.isArray((this.filtersForm.value as any)[c.key]) ? [] : '' };
    if (c.key === 'education') patch[c.key] = []; 
     if (c.key === 'bloodType') patch[c.key] = []; 
     if (c.key === 'placeCode') patch[c.key] = [];  // ⬅️ مهم


    if (['birthFrom','birthTo','workFrom','workTo','actionFrom','actionTo'].includes(c.key)) patch[c.key] = null;
    if (['salaryFrom','salaryTo'].includes(c.key)) patch[c.key] = null;
    if (c.key === 'nationalities') patch[c.key] = [];
    this.filtersForm.patchValue(patch);
  }

  resetFilters() {
    this.filtersForm.reset({
      gender: '', 
      jobTitle:  [this.ALL],
      // education: '', 
      education: [this.ALL],
      // bloodType: '',
      bloodType:[this.ALL],
      placeCode: [this.ALL],
       nationalities: [],
      birthFrom: null, birthTo: null, workFrom: null, workTo: null,
      actionFrom: null, actionTo: null,
      salaryFrom: null, salaryTo: null,
      q: '' ,
      
    });
     // ⬅️ امسح التخزين الدائم
  localStorage.removeItem(this.STORAGE_KEY);
  this.triggerFilter();
  }
// onEducationChange() {
//   const selected = this.filtersForm.value.education as string[] | null;
//   // إذا اختير "الكل" مع عناصر أخرى، ثبّت "الكل" فقط
//   if (selected && selected.includes(this.ALL) && selected.length > 1) {
//     this.filtersForm.patchValue({ education: [this.ALL] }, { emitEvent: false });
//   }
//   this.triggerFilter;
// }
// onEducationChange() {
//   const selected = this.filtersForm.value.education as string[] | null;
//   if (selected && selected.includes(this.ALL) && selected.length > 1) {
//     this.filtersForm.patchValue({ education: [this.ALL] }, { emitEvent: false });
//   }

//   const selected2 = this.filtersForm.value.bloodType as string[] | null;
//   if (selected2 && selected2.includes(this.ALL) && selected2.length > 1) {
//     this.filtersForm.patchValue({ bloodType: [this.ALL] }, { emitEvent: false });
//   }
//   this.saveFilters();   // اختياري: لأن valueChanges سيحفظ أيضًا عند تغييرات أخرى
//   this.triggerFilter(); // ← لازم أقواس
// }

// onMultiSelectChange(controlName: 'education' | 'bloodType' | 'jobTitle' |'placeCode') {
//     const allOptions = this.OPTIONS[controlName];

//    let selected = (this.filtersForm.value[controlName] as string[] | null) ?? [];

//   // const selected = this.filtersForm.value[controlName] as string[] | null;
//   if (selected && selected.includes(this.ALL) && selected.length > 1) {
//         selected = selected.filter(v => v !== this.ALL);

//     this.filtersForm.patchValue({ [controlName]: selected }, { emitEvent: false });
//   }  

//   if (selected.includes(this.ALL) && selected.length === 1) {
//     selected = [...allOptions]; // لا تُدرج ALL ضمن الخيارات الفعلية
//   }

//   // 2) إذا كانت ALL + عناصر أخرى (نقر لاحق بعد اختيار الكل) → احذف ALL واترك العناصر الفعلية
//   if (selected.includes(this.ALL) && selected.length > 1) {
//     selected = selected.filter(v => v !== this.ALL);
//   }

    
//   this.saveFilters?.();     // إن كنت تحفظ بالحالة
//   this.triggerFilter();     // لاحظ الأقواس
// }

// onMultiSelectChange(controlName: keyof typeof this.OPTIONS) {
//   const allOptions = this.OPTIONS[controlName];
//   let selected = (this.filtersForm.value[controlName] as string[] | null) ?? [];

  
//   if (selected.includes(this.ALL)) {
//     selected = [...allOptions];
//   }


//   this.filtersForm.patchValue({ [controlName]: selected }, { emitEvent: false });
//   this.saveFilters?.();
//   this.triggerFilter();
// }

onMultiSelectChange(controlName: keyof typeof this.OPTIONS) {
  const ALL = this.ALL;
  const allOptions = this.OPTIONS[controlName];
  let selected = (this.filtersForm.value[controlName] as string[] | null) ?? [];

  // الحالة 1: المستخدم اختار "الكل" فقط → اعتبرها لا فلترة (اتركها كما هي)
  if (selected.length === 1 && selected[0] === ALL) {
    // لا تفعل شيئًا: ALL بمفرده يعني لا فلترة
  }

  // الحالة 2: إذا كانت القائمة تحتوي ALL ومعها عناصر أخرى → احذف ALL واترك العناصر الفعلية
  else if (selected.includes(ALL) && selected.length > 1) {
    selected = selected.filter(v => v !== ALL);
  }

  // الحالة 3 (اختيار يدوي لـ "الكل" لاحقًا): إن أردت أن يجعل "الكل" يختار كل العناصر
  // else if (selected.length === 1 && selected[0] === ALL) {
  //   selected = [...allOptions];
  // }

  this.filtersForm.patchValue({ [controlName]: selected }, { emitEvent: false });
  this.saveFilters?.();
  this.triggerFilter();
}

 //لنعرف شو اخر شي تم تحديدو من القائمة
onOptionToggle(controlName: keyof typeof this.OPTIONS,
               e: MatOptionSelectionChange,
               value: string) {
  if (!e.isUserInput) return; // تجاهل تغييرات ليست من المستخدم
  const ALL = this.ALL;
  const allOptions = this.OPTIONS[controlName];
  let selected: string[] = [...((this.filtersForm.value[controlName] as string[]) ?? [])];

  if (value === ALL) {
    if (e.source.selected) {
      // المستخدم اختار "الكل" الآن → إمّا لا فلترة أو كل العناصر (اختر واحدة)
      // خيار 1: لا فلترة برمز ALL فقط
      selected = [ALL];
      // خيار 2: أو اختيار كل العناصر فعليًا
      // selected = [...allOptions];
    } else {
      // المستخدم ألغى "الكل"
      selected = [];
    }
  } else {
    if (e.source.selected) {
      // اختيار عنصر محدد → احذف ALL إن وجد
      selected = selected.filter(v => v !== ALL);
      if (!selected.includes(value)) selected.push(value);
    } else {
      // إزالة عنصر محدد
      selected = selected.filter(v => v !== value);
      if (selected.length === 0) {
        // رجّعها لـ ALL (لا فلترة) إذا تحب هذا السلوك
        selected = [ALL];
      }
    }
  }

  this.filtersForm.patchValue({ [controlName]: selected });
  this.saveFilters?.();
  this.triggerFilter();
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

  // قائمة الأعمدة المتاحة
allColumns: ColumnDef[] = [
  { id: 'index',     label: '#',              selectable: false, always: true },
  { id: 'fullName',  label: 'الاسم الكامل',   selectable: true,  always: true },
  { id: 'jobTitle',  label: 'المسمى الوظيفي', selectable: true,  default: true },
  { id: 'bloodType',  label: 'زمرة الدم ', selectable: true,  },
  { id: 'education', label:  'التحصيل العلمي',        selectable: true ,default:true},
  { id: 'placeCode', label: 'مكان المباشرة',  selectable: true },
  { id: 'dateActionWork', label: 'تاريخ المباشرة',  selectable: true , },
  { id: 'workDate', label: 'تاريخ  التعيين',  selectable: true },
   { id: 'birthDate', label: 'تاريخ  الميلاد',  selectable: true },

  { id: 'actions',   label: 'إجراءات',        selectable: false, always: true },
];


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
  employee?: Employee;

get placeActionWork(): string {
  return this.employee?.placeActionWork
    ?? (this.employee as any)?.workdetails?.placeActionWork
    ?? '—';
}




}
//here will define all colowmns may be appear

//خارج الكلاس من اجل الاستدعاء

type ColId =
  | 'index'
  | 'fullName'
  | 'jobTitle'
  | 'bloodType'
  | 'education'
  | 'placeCode'
  |'dateActionWork'
  | 'workDate'
  | 'birthDate'
  | 'actions';

interface ColumnDef {
  id: ColId;
  label: string;
  selectable: boolean;
  always?: boolean;
  default?: boolean;
}



