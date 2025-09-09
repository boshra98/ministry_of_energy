// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterLink } from '@angular/router';
// import { MatCardModule } from '@angular/material/card';
// import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// import { MatSortModule } from '@angular/material/sort';
// import { MatPaginatorModule } from '@angular/material/paginator';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';

// import { LocalEmployeesService, Employee } from '../../../services/local-employees.service';
// @Component({
//   selector: 'app-search',
//   imports: [
//     CommonModule,
//     RouterLink,
//     MatCardModule,
//     MatTableModule,
//     MatSortModule,
//     MatPaginatorModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatIconModule,
//     MatButtonModule,
//   ],
//   templateUrl: './search.component.html',
//   styleUrl: './search.component.scss'
// })
// export class SearchComponent {
//  today = () => new Date();
//  goHome() {
//     this.router.navigate(['']);
// }

// dataSource = new MatTableDataSource<Employee>([] as Employee[]);

//   constructor(
//     private store: LocalEmployeesService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.refresh();
//     // فلترة بالعربية والإنجليزية
//     this.dataSource.filterPredicate = (data, filter) => {
//       const text = ([
//         data.firstName, data.lastName, data.fatherName, data.jobTitle,
//         data.gender, data.paperFileNumber, data.residence, data.birthDate
//       ].join(' ') || '').toLowerCase();
//       return text.includes(filter.trim().toLowerCase());
//     };
//   }

//   applyFilter(value: string) {
//     this.dataSource.filter = value.trim().toLowerCase();
//   }

//   refresh() {
//     this.dataSource.data = this.store.list();
//   }
  
//   displayedColumns: string[] = [
//     'index',
//     'fullName',
//     'jobTitle',
//     'actions'
  
//   ];

//    browseEmployee(emp: Employee) {
//     this.router.navigate(['/employees/browse', emp.id]);
    
//   }

// }




import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { LocalEmployeesService, Employee } from '../../../services/local-employees.service';

@Component({
  selector: 'app-search',
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
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  today = () => new Date();

  // جدول يبدأ فارغ
  dataSource = new MatTableDataSource<Employee>([]);

  // نخزّن كل الموظفين للبحث المحلي بدون عرضهم عند التحميل
  private allEmployees: Employee[] = [];

  // أقل طول لبدء البحث (يمكنك تغييره)
  private readonly minLen = 2;

  displayedColumns: string[] = ['index', 'fullName', 'jobTitle', 'actions'];

  constructor(
    private store: LocalEmployeesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // حمّل البيانات داخليًا فقط للاستخدام في الفلترة، لا تضعها في الجدول
    this.allEmployees = this.store.list();

    // (اختياري) فلتر مخصص إن أردت استخدام dataSource.filter لاحقًا
    // هنا لن نستخدمه لأننا سنملأ dataSource.data يدويًا
    // this.dataSource.filterPredicate = ...
  }

  goHome() {
    this.router.navigate(['']);
  }

  // applyFilter(value: string) {
  //   const q = (value || '').trim().toLowerCase();

  //   // إبقِ الجدول فارغًا إن كان النص قصيرًا
  //   if (q.length < this.minLen) {
  //     this.dataSource.data = [];
  //     return;
  //   }

  //   // فلترة محلية فقط عند وجود استعلام كافٍ
  //   this.dataSource.data = this.allEmployees.filter(e => {
  //     const fullName = `${e.firstName ?? ''} ${e.fatherName ?? ''} ${e.lastName ?? ''}`.toLowerCase();
  //     const jobTitle = (e.jobTitle ?? '').toLowerCase();
  //     const fileNum  = String(e.paperFileNumber ?? '').toLowerCase();
  //     const residence = (e.residence ?? '').toLowerCase();
  //     const birthDate = (e.birthDate ?? '').toLowerCase();


  //     return (
  //       fullName.includes(q) ||
  //       jobTitle.includes(q) ||
  //       fileNum.includes(q) ||
  //       residence.includes(q) ||
  //       birthDate.includes(q)
  //     );
  //   });
  // }


  applyFilter(value: string) {
  const q = (value || '').trim().toLowerCase();

  if (q.length < 2) {
    this.dataSource.data = [];
    return;
  }

  // كل الحقول التي تريد إدراجها في البحث
  const fields: (keyof Employee)[] = [
    'firstName', 'fatherName', 'lastName', 'motherName',
    'jobTitle', 'paperFileNumber', 'residence', 'birthDate',
    'gender', 'collage', 'education', 'workDate',
    'nationalNumber', 'idNumber', 'placeBirth',
    'centralSecretaion', 'familyRegistration', 'materialStatus',
    'nationality', 'bloodType', 'permenentAddress', 
    'phoneNumber', 'whatsappNumber', 'email',
    'sourceAcadimicQualification', 'dateQualification', 'detailsQualification',
    'decisionStart', 'placeActionWork', 'dateActionWork',
    'appointmentType', 'jobCategory', 'jobAttribute',
    'startingSalary', 'notes', 'currentSalary', 'statusWork',
    'dateStatusWork', 'currentJoblocation', 'currentDecisionAppointment',
    'datecurrentDecisionAppointment'
  ];

  this.dataSource.data = this.allEmployees.filter(emp => {
    // نجمع القيم من كل الحقول ونحوّلها لنص واحد
    const text = fields
      .map(f => String((emp as any)[f] ?? '').toLowerCase())
      .join(' ');

    return text.includes(q);
  });
}


  // لم نعد نحتاج refresh() الذي كان يملأ الجدول عند التحميل
  // اتركه محذوفًا أو فارغًا إن كان مستخدمًا بمكان آخر

  browseEmployee(emp: Employee) {
    this.router.navigate(['/employees/browse', emp.id]);
  }
}
