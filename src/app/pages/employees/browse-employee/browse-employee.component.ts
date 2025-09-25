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

@Component({
  standalone: true,
  selector: 'app-browse-employee',
 imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule, MatChipsModule, MatButtonModule,OrgNamePipe],

  templateUrl: './browse-employee.component.html',
  styleUrls: ['./browse-employee.component.scss'],
})
export class BrowseEmployeeComponent implements OnInit, OnDestroy {
// edit() {
// throw new Error('Method not implemented.');
// }

  edit(emp: Employee) {
    this.router.navigate(['/employees/edit', emp.id]);
  }
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private store  = inject(LocalEmployeesService);
  private lookup = inject(LookupService);

  private destroy$ = new Subject<void>();

  OTHER_VALUE = OTHER_VALUE;

  orgTree: OrgNode[] = DEPARTMENTS;
  orgOpts = { tree: this.orgTree, mode: 'path' as const, sep: ' | ' };

  employee?: Employee;
  loading = true;
  notFound = false;
  photoUrl?: string;

  // خرائط لتحويل الأكواد إلى تسميات
  genderMap   = new Map<string, string>();
  maritalMap  = new Map<string, string>();
  jobTitleMap = new Map<string, string>();
  emergencyContentRelationMap = new Map<string,string>();
  jobAttributeMap = new Map<string, string>(); // 
  jobCategoryMap = new Map<string, string>(); 
  decisionAttributeMap = new Map<string, string>();
  appointmentTypesMap = new Map<string, string>();




window: any;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.notFound = true; this.loading = false; return; }

    // جِب الموظف
    const list = this.store.list();
    this.employee = list.find(e => e.id === id) ?? undefined;
    this.notFound = !this.employee;
    this.loading = false;

    // ابنِ الخرائط من الـLookupService
    this.lookup.genders$
      .pipe(takeUntil(this.destroy$))
      .subscribe((opts: LookupOption[]) => {
        this.genderMap = new Map(opts.map(o => [o.value, o.label]));
      });

    this.lookup.maritalStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((opts: LookupOption[]) => {
        this.maritalMap = new Map(opts.map(o => [o.value, o.label]));
      });

    this.lookup.jobTitles$
      .pipe(takeUntil(this.destroy$))
      .subscribe((opts: LookupOption[]) => {
        this.jobTitleMap = new Map(opts.map(o => [o.value, o.label]));
      });

      this.lookup.JOBATTRIBUTE_DEFAULTES$
  .pipe(takeUntil(this.destroy$))
  .subscribe((opts: LookupOption[]) => {
    // value → label
    this.jobAttributeMap = new Map(opts.map(o => [o.value, o.label]));
  });

   this.lookup.JOBCATEGORY_DEFAULTES$
  .pipe(takeUntil(this.destroy$))
  .subscribe((opts: LookupOption[]) => {
    // value → label
    this.jobCategoryMap = new Map(opts.map(o => [o.value, o.label]));
  });
  this.lookup.emergencyRelations$
  .pipe(takeUntil(this.destroy$))
  .subscribe((opts: LookupOption[]) =>{
    this.emergencyContentRelationMap = new Map(opts.map(o => [o.value, o.label]));
  }
  );
  this.lookup.decisionAttribute_DEFAULTES$
  .pipe(takeUntil(this.destroy$))
  .subscribe((opts: LookupOption[]) => {
    // value → label
    this.decisionAttributeMap = new Map(opts.map(o => [o.value, o.label]));

  });

  this.lookup.appointmentTypes_DEFAULTES$
  .pipe(takeUntil(this.destroy$))
  .subscribe((opts: LookupOption[]) => {
    // value → label
    this.appointmentTypesMap = new Map(opts.map(o => [o.value, o.label]));
  });
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // —— تنقّل —— //
  goHome() {
    this.router.navigate(['']);
  }
  back() {
    this.router.navigate(['/search']);
  }


  private get jobAttributeValue(): string | undefined {
  const e: any = this.employee;
  // يدعم إن كانت بالقسم العلوي أو داخل workdetails
  return e?.jobAttribute ?? e?.workdetails?.jobAttribute ?? undefined;
}

 private get jobCayegoryValue(): string | undefined {
  const e: any = this.employee;
  // يدعم إن كانت بالقسم العلوي أو داخل workdetails
  return e?.jobCategory ?? e?.workdetails?.jobCategory ?? undefined;
}
 private get EMERGENCyValues(): string | undefined {
  const e: any = this.employee;
  // يدعم إن كانت بالقسم العلوي أو داخل workdetails
  return e?.emergencyContentRelation ?? e?.communication?.EMERGENCY_RELATIONS ?? undefined;
}

private get decisionAttributeValue(): string | undefined {
  const e: any = this.employee;
  return e?.decisionAttribute ?? e?.workdetails?.decisionAttribute ?? undefined;
}

private get appointemntTypeValue(): string | undefined {
  const e: any = this.employee;
  return e?.appointemntType ?? e?.workdetails?.appointemntType ?? undefined;
}

get jobAttributeLabel(): string {
  const v = this.jobAttributeValue;
  if (!v) return '—';
  // توافق خلفي: لو كانت البيانات القديمة مخزنة label وليس value
  return this.jobAttributeMap.get(v) ?? v;
}

get jobCategoryLabel(): string {
  const v = this.jobCayegoryValue;
  if (!v) return '—';
  // توافق خلفي: لو كانت البيانات القديمة مخزنة label وليس value
  return this.jobCategoryMap.get(v) ?? v;
}

get EMERGENCYLabel(): string {
  const v = this.EMERGENCyValues;
  if (!v) return '—';
  // توافق خلفي: لو كانت البيانات القديمة مخزنة label وليس value
  return this.emergencyContentRelationMap.get(v) ?? v;

}
get decisionAttributeLabel(): string {

  const v = this.decisionAttributeValue;
  if (!v) return '—';
  return this.decisionAttributeMap.get(v) ?? v;


}
get appointmentTypesLabel(): string {
  const v = this.appointemntTypeValue;
  if (!v) return '—';
  return this.appointmentTypesMap.get(v) ?? v;
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
    let list: string[] = Array.isArray(raw)
      ? raw
      : (typeof raw === 'string' ? raw.split(/[,\u060C]/) : []);

    list = list
      .map(v => (typeof v === 'string' ? v.trim() : ''))
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

  // استخدمها في القالب:
  get genderLabel(): string {
    return this.labelOf(this.genderMap, this.employee?.gender);
  }
  get maritalStatusLabel(): string {
    return this.labelOf(this.maritalMap, this.employee?.materialStatus);
  }
  get jobTitleLabel(): string {
    return this.labelOf(this.jobTitleMap, this.employee?.jobTitle);
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

  // —— مسار مكان المباشرة —— //
  get placeActionWork(): string {
    return this.employee?.placeActionWork
      ?? (this.employee as any)?.workdetails?.placeActionWork
      ?? '—';
  }
}
