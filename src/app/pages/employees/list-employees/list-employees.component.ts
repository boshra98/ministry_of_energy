// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-list-employees',
//   imports: [],
//   templateUrl: './list-employees.component.html',
//   styleUrl: './list-employees.component.scss'
// })
// export class ListEmployeesComponent {

// }


import { Component, OnInit } from '@angular/core';
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
  ],
})
export class ListEmployeesComponent implements OnInit {
goHome() {
    this.router.navigate(['']);
}
// today(): string|number|Date 

// {
// throw new Error('Method not implemented.');
// }


  today = () => new Date();

  displayedColumns: string[] = [
    'index',
    'fullName',
    'jobTitle',
    'gender',
    'birthDate',
    'paperFileNumber',
    'residence',
    'actions',
    
  ];

  dataSource = new MatTableDataSource<Employee>([] as Employee[]);

  constructor(
    private store: LocalEmployeesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refresh();
    // فلترة بالعربية والإنجليزية
    this.dataSource.filterPredicate = (data, filter) => {
      const text = ([
        data.firstName, data.lastName, data.fatherName, data.jobTitle,
        data.gender, data.paperFileNumber, data.residence, data.birthDate
      ].join(' ') || '').toLowerCase();
      return text.includes(filter.trim().toLowerCase());
    };
  }

  applyFilter(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  refresh() {
    this.dataSource.data = this.store.list();
  }
  

  edit(emp: Employee) {
    this.router.navigate(['/employees/edit', emp.id]);
    
  }

  remove(emp: Employee) {
    const ok = confirm(`هل أنت متأكد من حذف الموظف: ${emp.firstName} ${emp.lastName}؟`);
    if (!ok) return;
    // حذف بسيط: أعد كتابة القائمة بدون هذا الموظف
    const rest = this.store.list().filter(e => e.id !== emp.id);
    // استدعاء داخلي لكتابة الكل (إضافة دالة clear/write إن أردت)، سنستعمل حيلة سريعة:
    (localStorage.setItem as any)('employees', JSON.stringify(rest));
    this.refresh();
  }
}
