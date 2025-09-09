// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-edit-employee',
//   imports: [],
//   templateUrl: './edit-employee.component.html',
//   styleUrl: './edit-employee.component.scss'
// })
// export class EditEmployeeComponent {

// }


import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  LocalEmployeesService,
  Employee,
  EmployeeUpdate
} from '../../../services/local-employees.service';

type EmployeeForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  fatherName: FormControl<string>;
  paperFileNumber: FormControl<string>;
  gender: FormControl<string>;
  residence: FormControl<string>;
  jobTitle: FormControl<string>;
  birthDate: FormControl<string>; // من <input type="date">
}>;

@Component({
  standalone: true,
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss'],
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ]
})
export class EditEmployeeComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store  = inject(LocalEmployeesService);
  private snack  = inject(MatSnackBar);
  id!: string;

  // — حالة الصفحة —
  editingId: string | null = null;
  loading = true;
  notFound = false;

  // — النموذج المTyped —
  form: EmployeeForm = new FormGroup({
    firstName:       new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    lastName:        new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    fatherName:      new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    paperFileNumber: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{1,10}$/)] }),
    gender:          new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    residence:       new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    jobTitle:        new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    birthDate:       new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  // — بيانات القوائم —
  genders: Array<{ value: string; label: string }> = [
    { value: 'male', label: 'ذكر' },
    { value: 'female', label: 'أنثى' },
  ];
  jobTitles: string[] = ['مدرّس', 'محاسب', 'سكرتير', 'مبرمج'];

  // Getters لعرض الأخطاء بسهولة في القالب
  get firstNameCtrl()       { return this.form.controls.firstName; }
  get lastNameCtrl()        { return this.form.controls.lastName; }
  get fatherNameCtrl()      { return this.form.controls.fatherName; }
  get paperFileNumberCtrl() { return this.form.controls.paperFileNumber; }
  get genderCtrl()          { return this.form.controls.gender; }
  get residenceCtrl()       { return this.form.controls.residence; }
  get jobTitleCtrl()        { return this.form.controls.jobTitle; }
  get birthDateCtrl()       { return this.form.controls.birthDate; }

  ngOnInit(): void {

     this.loading = true;

  this.route.paramMap.subscribe(pm => {
    const idParam = pm.get('id');    //قراءة قيمة الباراميتر        // string | null
    this.editingId = idParam ?? null;  //تخزين قيمة ال id

    if (!this.editingId) {
      this.notFound = true;
      this.loading = false;
      return;
    }
//جلب الموظف
      const emp = this.findEmployee(this.editingId);
      if (!emp) {
        this.notFound = true;
        this.loading = false;
        return;
      }
//تعبئة النموذج
      this.patchForm(emp);
      this.loading = false;
    });
  }
//دالة البحث عن نموذج
  private findEmployee(id: string): Employee | undefined {
    return this.store.list().find(e => e.id === id);

  }

  private patchForm(emp: Employee) {
    this.form.patchValue({
      firstName: emp.firstName,
      lastName: emp.lastName,
      fatherName: emp.fatherName,
      paperFileNumber: emp.paperFileNumber,
      gender: emp.gender,
      residence: emp.residence,
      jobTitle: emp.jobTitle,
      birthDate: emp.birthDate, // نص yyyy-MM-dd
    }); 
  }

  save() {
    if (this.form.invalid || !this.editingId) {
      this.form.markAllAsTouched();
      return;
    }
    const patch: EmployeeUpdate = { id: this.editingId, ...this.form.getRawValue() };
    const updated = this.store.update(patch);
    if (updated) {
      this.snack.open('تم تحديث بيانات الموظف بنجاح ✅', 'إغلاق', { duration: 2500 });
      this.router.navigate(['/employees','list']);
    } else {
      this.snack.open('تعذّر التحديث: الموظف غير موجود', 'إغلاق', { duration: 2500 });
    }
  }

  cancel() {
    this.router.navigate(['/employees']);
  }
}
