// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-list-employees',
//   imports: [],
//   templateUrl: './list-employees.component.html',
//   styleUrl: './list-employees.component.scss'
// })
// export class ListEmployeesComponent {

// }


import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenu }   from '@angular/material/menu';

import { LocalEmployeesService, Employee, OTHER_VALUE } from '../../../services/local-employees.service';
import { LookupService } from '../../../services/lookup.service';
import { Subject, takeUntil } from 'rxjs';
import { DEPARTMENTS, OrgNode } from '../../../models/department';
import { LookupOption } from '../../../shared/lookups/lookups.types';
import { MatDivider } from "@angular/material/divider";

@Component({
  standalone: true,
  selector: 'app-list-employees',
  templateUrl: './list-employees.component.html',
  styleUrls: ['./list-employees.component.scss'],
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDivider,
    MatMenu ,
    MatMenuModule
],
})
// export class ListEmployeesComponent implements OnInit  ,OnDestroy{

// goHome() {
//     this.router.navigate(['']);
// }


//   today = () => new Date();

//   displayedColumns: string[] = [
//     'index',
//     'fullName',
//     'jobTitle',
//     'gender',
//     'birthDate',
//     'paperFileNumber',
//     'residence',
//     'actions',
    
//   ];

//   dataSource = new MatTableDataSource<Employee>([]);

//   constructor(
//     private store: LocalEmployeesService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.refresh();

//     this.dataSource.filterPredicate = (data, filter) => {
//       const birth = this.ymd(data.birthDate);
//       const text = ([
//         data.firstName ?? '',
//         data.lastName ?? '',
//         data.fatherName ?? '',
//         data.jobTitle ?? '',
//         data.gender ?? '',
//         data.paperFileNumber ?? '',
//         data.residence ?? '',
//         birth,
//       ].join(' ') || '').toLowerCase();

//       return text.includes((filter || '').trim().toLowerCase());
//     };
//   }
//     // فلترة بالعربية والإنجليزية
  
  

//   applyFilter(value: string) {
//     this.dataSource.filter = (value ?? '').trim().toLowerCase();
//   }

//   refresh() {
//     // readAll في الخدمة يُعيد Date بفضل reviveDates
//     this.dataSource.data = this.store.list();
//   }

//   edit(emp: Employee) {
//     this.router.navigate(['/employees/edit', emp.id]);
//   }

//   remove(emp: Employee) {
//     const ok = confirm(`هل أنت متأكد من حذف الموظف: ${emp.firstName} ${emp.lastName}؟`);
//     if (!ok) return;
//     // يفضَّل أن يكون لدينا دالة remove في الخدمة:
//     if (typeof (this.store as any).remove === 'function') {
//       (this.store as any).remove(emp.id);
//     } else {
//       // مؤقتًا: احذف بالفلترة ثم اكتب
//       const rest = this.store.list().filter(e => e.id !== emp.id);
//       localStorage.setItem('employees', JSON.stringify(rest));
//     }
//     this.refresh();
  
//   }
//    private ymd(d?: Date | null): string {
//     if (!d) return '';
//     const yyyy = d.getFullYear();
//     const mm = String(d.getMonth() + 1).padStart(2, '0');
//     const dd = String(d.getDate()).padStart(2, '0');
//     return `${yyyy}-${mm}-${dd}`;
//   }
// }


export class ListEmployeesComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private store  = inject(LocalEmployeesService);
  private lookup = inject(LookupService);

  private destroy$ = new Subject<void>();

  
goHome() {
    this.router.navigate(['']);
}


  today = () => new Date();

  displayedColumns: string[] = [
    'index',
    'fullName',
    // 'jobTitle',
    'gender',
    'birthDate',
    // 'paperFileNumber',
    // 'residence',
    'actions',
  ];

  dataSource = new MatTableDataSource<Employee>([]);

  // خرائط اختيارية لتحويل الأكواد إلى تسميات داخل خلايا الجدول
  genderMap   = new Map<string, string>();
  jobTitleMap = new Map<string, string>();

  ngOnInit(): void {
    // فلترة
    this.dataSource.filterPredicate = (data, filter) => {
      const birth = this.ymd(data.birthDate);
      const text = ([
        data.firstName ?? '',
        data.lastName ?? '',
        data.fatherName ?? '',
        data.jobTitle ?? '',
        data.gender ?? '',
        data.paperFileNumber ?? '',
        data.residence ?? '',
        birth,
      ].join(' ') || '').toLowerCase();
      return text.includes((filter || '').trim().toLowerCase());
    };

    // جهّز البيانات
    this.refresh();

    // لو بدك تُظهر تسميات بدلاً من الأكواد في الجدول:
    this.lookup.genders$
      .pipe(takeUntil(this.destroy$))
      .subscribe((opts: LookupOption[]) => {
        this.genderMap = new Map(opts.map(o => [o.value, o.label]));
      });

    this.lookup.jobTitles$
      .pipe(takeUntil(this.destroy$))
      .subscribe((opts: LookupOption[]) => {
        this.jobTitleMap = new Map(opts.map(o => [o.value, o.label]));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilter(value: string) {
    this.dataSource.filter = (value ?? '').trim().toLowerCase();
  }

  refresh() {
    this.dataSource.data = this.store.list(); // تعبئة الجدول
  }

  edit(emp: Employee) {
    this.router.navigate(['/employees/edit', emp.id]);
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

  labelOf(map: Map<string, string>, code?: string | null): string {
    if (!code) return '—';
    return map.get(code) ?? code; // أعِد code كـ fallback لو كانت البيانات القديمة مخزنة label
  }

  private ymd(d?: Date | null): string {
    if (!d) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }


confirmRemove(e: any) {
  const ok = confirm(`هل تريد حذف الموظف (${e.firstName} ${e.lastName}) نهائيًا؟`);
  if (ok) this.remove(e);
}


}
