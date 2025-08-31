import { MatCardModule } from '@angular/material/card';
// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-add-employee',
//   imports: [],
//   templateUrl: './add-employee.component.html',
//   styleUrl: './add-employee.component.scss'
// })
// export class AddEmployeeComponent {

// }



// 


// import { FormControl, FormGroup, Validators } from '@angular/forms';


// type EmployeeForm = FormGroup<{
//   firstName: FormControl<string>;
//   gender: FormControl<string>;
// }>;

// export class AddEmployeeComponent {
//   form: EmployeeForm = new FormGroup({
//     firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
//     gender: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
//   });
// }




import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDatepickerModule, MatDatepickerActions } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import {
  LocalEmployeesService,
  NewEmployee,
  EmployeeUpdate,
  Employee
} from '../../../services/local-employees.service';

type EmployeeForm = FormGroup<{
  residence: FormControl<string>;
  jobTitle: FormControl<string>;
  birthDate: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  fatherName: FormControl<string>;
  paperFileNumber: FormControl<string>;
  gender: FormControl<string>;
  collage:FormControl<string>;
  education:FormControl<string>;
  workDate: FormControl<Date | null>;
}>;

@Component({
  standalone: true,
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerActions,
     MatDatepickerModule,
    MatNativeDateModule,
    
],
})
export class AddEmployeeComponent {
dataSource: any;
goHome() {
    this.router.navigate(['']);
}
  today = () => new Date();

  form: EmployeeForm = new FormGroup({
    firstName:       new FormControl('', { nonNullable: true, validators: [Validators.required , Validators.pattern(/^[\p{L}\s]+$/u) // ✅ فقط أحرف + مسافات (أي لغة)
 ]  }),
    lastName:        new FormControl('', { nonNullable: true, validators: [Validators.required ,Validators.pattern(/^[\p{L}\s]+$/u)] }),
    fatherName:      new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[\p{L}\s]+$/u)] }),
    paperFileNumber: new FormControl('', { nonNullable: true, validators: [ Validators.pattern(/^[0-9]+$/)
] }),
    gender:          new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    residence:       new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    jobTitle:        new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    birthDate:       new FormControl('', { nonNullable: true, validators: [Validators.required] }),
   collage:         new FormControl('', { nonNullable: true,  }),
   education:       new FormControl('', { nonNullable: true,  }),
  //  workDate:       new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  workDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),

  });

  // إذا وُجدت قيمة هنا فالمكوّن في وضع التعديل
  editingId: string | null = null;

  genders: Array<{ value: string; label: string }> = [
    { value: 'male', label: 'ذكر' },
    { value: 'female', label: 'أنثى' },
  ];
  jobTitles: string[] = ['مدرّس', 'محاسب', 'سكرتير', 'مبرمج'];
  educations: string[]=['ابتدائي','اعدادي','ثانوي','بكالوريوس','ماستر','دكتوراه']
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: LocalEmployeesService
  ) {
    // قراءة :id إن وُجد لتفعيل وضع التعديل
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (!id) return;
      this.editingId = id;
      const emp = this.findEmployee(id);
      if (emp) this.patchForm(emp);
    });
  }

  // —— Getters للاختصارات في القالب ——
  get firstNameCtrl()       { return this.form.controls.firstName; }
  get lastNameCtrl()        { return this.form.controls.lastName; }
  get fatherNameCtrl()      { return this.form.controls.fatherName; }
  get paperFileNumberCtrl() { return this.form.controls.paperFileNumber; }
  get genderCtrl()          { return this.form.controls.gender; }
  get residenceCtrl()       { return this.form.controls.residence; }
  get jobTitleCtrl()        { return this.form.controls.jobTitle; }
  get birthDateCtrl()       { return this.form.controls.birthDate; }
  get workDateCtrl()       { return this.form.controls.workDate; }
  get collageCtrl()       { return this.form.controls.collage; }
  get educationCtrl()       { return this.form.controls.education; }

  // —— وظائف مساعدة ——
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
      birthDate: emp.birthDate, 
      workDate:emp.workDate,
      collage:emp.collage,
      education:emp.education,// 
    });
  }

  // —— الحفظ/التحديث ——
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.editingId) {
      // تحديث موجود
      const patch: EmployeeUpdate = { id: this.editingId, ...this.form.getRawValue() };
      const updated = this.store.update(patch);
      console.log('✅ Updated:', updated);
    } else {
      // إضافة جديد
      const payload: NewEmployee = this.form.getRawValue();
      const saved = this.store.add(payload);
      console.log('✅ Added:', saved);
      this.editingId = saved.id; // لو احتجت تبقى على الصفحة وتحوّلها لتعديل
    }

    this.router.navigate(['/employees']);
  }
}
//this file for add employee test on git