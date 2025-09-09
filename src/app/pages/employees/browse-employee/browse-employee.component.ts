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



import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalEmployeesService, Employee } from '../../../services/local-employees.service';
import { OrgNamePipe } from '../../../pipes/org-name.pipe';
import { DEPARTMENTS, Dept } from '../../../models/department';
import { OTHER_VALUE } from '../../../shared/constants';

@Component({
  selector: 'app-browse-employee',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule, MatChipsModule, MatButtonModule,OrgNamePipe],
  templateUrl: './browse-employee.component.html',
  styleUrls: ['./browse-employee.component.scss']
})
export class BrowseEmployeeComponent {
goHome() {
throw new Error('Method not implemented.');
}


orgTree: Dept[] = DEPARTMENTS;
orgOpts = { tree: this.orgTree, mode: 'path' as const, sep: ' | ' };



  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store  = inject(LocalEmployeesService);
window: any;

  employee?: Employee;
  loading = true;
  notFound = false;

  photoUrl?: string; // لو عندك صور
  qrText?: string;   // لو بدك QR

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.notFound = true; this.loading = false; return; }

    const list = this.store.list();
    this.employee = list.find(e => e.id === id);
    this.notFound = !this.employee;
    this.loading = false;
    console.log('placeActionWork =', this.placeActionWork);
  console.log('orgTree length =', this.orgTree?.length);
  }

  get nationalityListClean(): string[] {
  const list = (this.employee?.nationality ?? []) as string[];
  return list
    .map(v => (typeof v === 'string' ? v.trim() : ''))
    .filter(v => v && v !== OTHER_VALUE);
}

  // تنسيق تاريخ آمن لحقول التاريخ النصية (YYYY-MM-DD أو ISO)
  // formatDate(v?: string | null) {
  //   if (!v) return '—';
  //   const d = new Date(v);
  //   return isNaN(d.getTime()) ? v : d.toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' });
  // }

  formatDate(v?: string | Date | null): string {
  if (!v) return '—';

  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) return String(v);

  const day   = d.getDate().toString().padStart(2, '0');       // يوم برقمين
  const month = (d.getMonth() + 1).toString().padStart(2, '0'); // شهر برقمين
  const year  = d.getFullYear();

  return `${day}/${month}/${year}`;
}

today = () => new Date();

back() {
  this.router.navigate(['/search']); // أو المسار المناسب عندك
}
get placeActionWork(): string {
  return this.employee?.placeActionWork
    ?? (this.employee as any)?.workdetails?.placeActionWork
    ?? '—';
}


}
