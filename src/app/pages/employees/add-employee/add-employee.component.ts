import { MatCardModule } from '@angular/material/card';

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDatepickerModule, MatDatepickerActions } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
// import { AbstractControl, ValidationErrors } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';

import {
  LocalEmployeesService,
  NewEmployee,
  EmployeeUpdate,
  Employee
} from '../../../services/local-employees.service';
import { DEPARTMENTS, SubDept } from '../../../models/department';

import { OTHER_VALUE } from '../../../shared/constants';

// ===== Types =====

import { startWith, distinctUntilChanged, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import { MatChipSet, MatChipsModule } from "@angular/material/chips";
type ParsedPlace = { main?: string; sub?: string };


type EmployeeForm = FormGroup<{
  residence: FormControl<string>;
  jobTitle: FormControl<string>;
  birthDate: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  fatherName: FormControl<string>;
  motherName:FormControl<string>;
  paperFileNumber: FormControl<string>;
  gender: FormControl<string>;
  collage:FormControl<string>;
  education:FormControl<string>;
  workDate: FormControl<Date | null>;
  nationalNumber: FormControl<string>;  //الرقم الوطني
  idNumber:FormControl<string>;     //رقم الهوية
  placeBirth:FormControl<string>;   //مكان الولادة
  centralSecretaion:FormControl<string>; //الامانة المركزية
  familyRegistration:FormControl<string>; //القيد ورقمه
  materialStatus:FormControl<string>;  //الحالة الاجتماعية
  nationality:FormControl<string>;
  bloodType:FormControl<string>;
  permenentAddress:FormControl<string>;  
  currentAddress:FormControl<string>;
  phoneNumber:FormControl<string>;
  whatsappNumber:FormControl<string>;
  email:FormControl<string>;
  sourceAcadimicQualification:FormControl<string>; //مصدر المؤهل العلمي
  dateQualification:FormControl<string>; //تاريخ المؤهل
  detailsQualification:FormControl<string>;
  decisionStart:FormControl<string>;  //قرار  بدء التعيين
  placeActionWork:FormControl<string>; //  مكان مباشرة العمل
  dateActionWork:FormControl<string>;  //تاريخ المباشرة
  appointmentType:FormControl<string>; // نوع التعيين
  jobCategory:FormControl<string>; // الفئة الوظيفية
  jobAttribute:FormControl<string>; //الصفة الوظيفية 
  startingSalary:FormControl<string>; //راتب بدء التعيين
  notes:FormControl<string>;
    currentSalary:FormControl<string>;
  statusWork:FormControl<string>; //الحالة الوظيفية
  dateStatusWork:FormControl<string>;// تالايخ الحالة الوظيفية
  currentJoblocation:FormControl<string>;  //الموقع
  currentDecisionAppointment:FormControl<string>; //قرار التعيين الحالي
  datecurrentDecisionAppointment:FormControl<string>; //تاريخ التعيين الحالي
emergencyContentRelation:FormControl<string>;  //صلة القرابة
emergencyName:FormControl<string>;   // الاسم للطوارئ
emergencyPhone1:FormControl<string>;  // رقم الطوارئ
emergencyPhone2: FormControl<string>; 
dependences: FormControl<string>; 




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
    MatTabsModule,
    MatStepperModule,
    MatChipsModule
],
})
export class AddEmployeeComponent {

dataSource: any;
  OTHER_VALUE = OTHER_VALUE;

// new: Date|null;
goHome() {
    this.router.navigate(['']);
}
  today = () => new Date();

//   form: EmployeeForm = new FormGroup({
//     firstName:       new FormControl('', { nonNullable: true, validators: [Validators.required , Validators.pattern(/^[\p{L}\s]+$/u) // ✅ فقط أحرف + مسافات (أي لغة)
//  ]  }),
//     lastName:        new FormControl('', { nonNullable: true, validators: [Validators.required ,Validators.pattern(/^[\p{L}\s]+$/u)] }),
//     fatherName:      new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[\p{L}\s]+$/u)] }),
//     paperFileNumber: new FormControl('', { nonNullable: true, validators: [ Validators.pattern(/^[0-9]+$/)
// ] }),
//     gender:          new FormControl('', { nonNullable: true, validators: [Validators.required] }),
//     residence:       new FormControl('', { nonNullable: true, validators: [Validators.required] }),
//     jobTitle:        new FormControl('', { nonNullable: true, validators: [Validators.required] }),
//     birthDate:       new FormControl('', { nonNullable: true, validators: [Validators.required,strictIsoBirthdateValidator] }),
//    collage:         new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^[\p{L}\s]+$/u)]  }),
//    education:       new FormControl('', { nonNullable: true,  }),
//   //  workDate:       new FormControl('', { nonNullable: true, validators: [Validators.required] }),
//   workDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),

//   });

form = new FormGroup({
  basic: new FormGroup({
    firstName: new FormControl('', {nonNullable:true ,validators:[Validators.required, Validators.minLength(2), Validators.pattern(/^[\p{L}\s]+$/u)]}),
    lastName:  new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern(/^[\p{L}\s]+$/u)]),
    fatherName:new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern(/^[\p{L}\s]+$/u)]),
    motherName:new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern(/^[\p{L}\s]+$/u)]),
    gender:    new FormControl('', [Validators.required]),
    birthDate: new FormControl('', [Validators.required,  strictIsoBirthdateValidator]),
    // nationality:new FormControl('', Validators.required, ),
     nationality: new FormControl<string[]>([], { validators: Validators.required }),
      otherNationality: new FormControl<string>(''),

    materialStatus: new FormControl('', [Validators.required]),
    dependences: new FormControl(''),
  }),
  personals: new FormGroup({
 placeBirth:new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern(/^[\p{L}\s]+$/u)]),
 centralSecretaion:new FormControl('', [Validators.required,Validators.minLength(2), Validators.pattern(/^[\p{L}\s]+$/u)]),
 familyRegistration:new FormControl('', [Validators.required]),
 nationalNumber:new FormControl('', [Validators.required ,Validators.pattern(/^[0-9]+$/)]),
 idNumber:new FormControl('', [Validators.required ,Validators.pattern(/^[0-9]+$/)]),
 bloodType:new FormControl('', [Validators.required]),
  }),

  communication: new FormGroup({
permenentAddress:new FormControl('', [Validators.required]),
// currentAddress: new FormControl('', [Validators.required]),
residence: new FormControl('', [Validators.required]),
phoneNumber:new FormControl('', [Validators.required ,Validators.pattern(/^[0-9]+$/)]),
whatsappNumber:new FormControl('', [Validators.required , Validators.pattern(/^[0-9]+$/)]),
email:new FormControl('',  Validators.email),
emergencyName:new FormControl('', []),  // الاسم للطوارئ
emergencyContentRelation:new FormControl('', []), //صلة القرابة
emergencyPhone1:new FormControl('', []), // رقم الطوارئ
emergencyPhone2: new FormControl('', []),


  }),
  details: new FormGroup({
    paperFileNumber: new FormControl('', [ Validators.pattern(/^[0-9]+$/)]),
    collage:         new FormControl('', [ Validators.pattern(/^[\p{L}\s]+$/u)]),
    education:       new FormControl('', []),
    // workDate:        new FormControl<Date | null>(null, [Validators.required]),
    sourceAcadimicQualification:   new FormControl('', [Validators.pattern(/^[\p{L}\s]+$/u) ]),
    // dateQualification: new FormControl<Date | null>(null, [Validators.required]),
    dateQualification: new FormControl('', [strictIsoBirthdateValidator]),
    detailsQualification: new FormControl('', [Validators.pattern(/^[\p{L}\s]+$/u)]),
        jobTitle:  new FormControl('', []),


  }),
   workdetails: new FormGroup({
    decisionStart: new FormControl('', []),
    workDate:  new FormControl<Date | null>(null, [Validators.required]),

     mainDeptCode: new FormControl('', [Validators.required]), // الإدارة الأساسية
    subDeptCode:  new FormControl(''),                        // سيصبح required عند وجود فروع

  // أبقِ الحقل الأصلي للـModel لكن بدون pattern لأنه سيُملأ تلقائياً:
   placeActionWork: new FormControl(''),

    // placeActionWork: new FormControl('', [Validators.pattern(/^[\p{L}\s]+$/u)]),
    dateActionWork:new FormControl<Date | null>(null, [Validators.required]), //تاريخ المباشرة
  appointmentType: new FormControl('', [Validators.pattern(/^[\p{L}\s]+$/u)]),// نوع التعيين
  jobCategory: new FormControl('', [Validators.pattern(/^[\p{L}\s]+$/u)]),// الفئة الوظيفية
  jobAttribute: new FormControl('',  [Validators.pattern(/^[\p{L}\s]+$/u)]),//الصفة الوظيفية 
  startingSalary:new FormControl('', [ Validators.pattern(/^[0-9]+$/)]),//راتب بدء التعيين
  notes:new FormControl('', []),
   }) ,

  // currentworkdetails: new FormGroup({
  // currentSalary:new FormControl('', []),
  // statusWork:new FormControl('', []), //الحالة الوظيفية
  // dateStatusWork:new FormControl('', []),// تالايخ الحالة الوظيفية
  // currentJoblocation:new FormControl('', []),  //الموقع
  // currentDecisionAppointment:new FormControl('', []), //قرار التعيين الحالي
  // datecurrentDecisionAppointment:new FormControl('', []),

  //  })


});


  // إذا وُجدت قيمة هنا فالمكوّن في وضع التعديل
  editingId: string | null = null;

  genders: Array<{ value: string; label: string }> = [
    { value: 'male', label: 'ذكر' },
    { value: 'female', label: 'أنثى' },
  ];
  jobTitles: string[] = ['مدرّس', 'محاسب', 'سكرتير', 'مبرمج'];
  educations: string[]=['ابتدائي','اعدادي','ثانوي','بكالوريوس','ماستر','دكتوراه'];
materialStatus:string[]=['اعزب' , 'متزوج']
bloodTypes:string[]=['A-','A+', 'B-' ,'B+' , 'AB-' ,'AB+' , 'O+', 'O-'];

nationalities:String[]=['سوري','فلسطيني سوري' , 'لبناني' ,   'اردني',  'فلسطيني أردني', 'مصري', 'فلسطيني لبناني','حاصل على الجنسية التركية' ,'حاصل على الجنسية الخليجية','حاصل على الجنسية الأوروبية' , 'حاصل على الجنسية الاميركية','غير ذلك' ];


emergencyContentRelations:String[]=['أب','أخ','زوج','ابن', 'ام' ,'صديق' , 'قريب','غير ذلك'];

departments = DEPARTMENTS;
filteredSubs: SubDept[] = [];
  showOther = false;

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
onWorkPick(e: any) {
  console.log('picker ->', e.value, e.value instanceof Date);
  console.log('control ->', this.workDateCtrl.value);
  console.log('control ->', this.dateActionWorkCtrl.value);


}

private destroy$ = new Subject<void>();

ngOnInit(): void {
  this.mainDeptCodeCtrl.valueChanges
    .pipe(
      startWith(this.mainDeptCodeCtrl.value),   // ← مهم للتهيئة بعد patchForm
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    )
    .subscribe((code: string | null) => {
      const dept = this.departments.find(d => d.code === code);
      this.filteredSubs = dept?.subs ?? [];

      // لا تمسح قيمة الفرعي إذا كانت ما تزال صالحة
      const currentSub = this.subDeptCodeCtrl.value as string | null;
      const stillValid = !!currentSub && this.filteredSubs.some(s => s.code === currentSub);
      if (!stillValid) {
        this.subDeptCodeCtrl.reset('');
      }

      // subDeptCode مطلوب فقط إذا كان هناك فروع
      if (this.filteredSubs.length) {
        this.subDeptCodeCtrl.setValidators([Validators.required]);
      } else {
        this.subDeptCodeCtrl.clearValidators();
      }
      this.subDeptCodeCtrl.updateValueAndValidity({ emitEvent: false });
    });
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
onNationalityChange(e: MatSelectChange) {
    const ctrl = this.basic.get('nationality') as FormControl<string[]>;
    const values = ctrl.value ?? [];

    // إذا كان "غير ذلك" ضمن الاختيارات → أظهر الحقل النصي
    if (values.includes(OTHER_VALUE) || values.includes('غير ذلك')) {
      this.showOther = true;
      // الأفضل توحيد القيمة إلى OTHER_VALUE فقط
      const normalized = values.map(v => (v === 'غير ذلك' ? OTHER_VALUE : v));
      ctrl.setValue(normalized, { emitEvent: false });
    } else {
      // إخفاء الحقل النصي وتفريغ محتواه عند عدم الحاجة
      this.showOther = false;
      (this.basic.get('otherNationality') as FormControl<string>).setValue('');
    }
  }

  // إدراج النص المدخل مكان OTHER_VALUE
  addOtherNationality() {
    const natCtrl   = this.basic.get('nationality') as FormControl<string[]>;
    const otherCtrl = this.basic.get('otherNationality') as FormControl<string>;

    const list  = natCtrl.value ?? [];
    const other = (otherCtrl.value ?? '').trim();

    if (!other) return;

    // إزالة placeholder لو موجود
    const withoutOther = list.filter(v => v !== OTHER_VALUE && v !== 'غير ذلك');

    // منع التكرار
    if (!withoutOther.includes(other)) {
      natCtrl.setValue([...withoutOther, other]);
    } else {
      natCtrl.setValue(withoutOther);
    }

    // تنظيف وإخفاء الحقل
    otherCtrl.setValue('');
    this.showOther = false;
  }


ngAfterViewInit() {
  // اختبار: إذا ظهر التاريخ بعد هذا، فالربط سليم وقيمة الروزنامة هي اللي ما توصل
  setTimeout(() => this.workDateCtrl.setValue(new Date()), 0);
}


// مجموعات
get basic()   { return this.form.get('basic')   as FormGroup; }
get details() { return this.form.get('details') as FormGroup; }

get personals(){return this.form.get('personals') as FormGroup;}
get communication(){return this.form.get('communication') as FormGroup;}
get workdetails(){return this.form.get('workdetails')as FormGroup;}
// get currentworkdetails(){return this .form.get('currentworkdetails')as FormGroup;}

// الحقول داخل basic
get firstNameCtrl()  { return this.basic.get('firstName')  as FormControl<string>; }
get lastNameCtrl()   { return this.basic.get('lastName')   as FormControl<string>; }
get fatherNameCtrl() { return this.basic.get('fatherName') as FormControl<string>; }
get motherNameCtrl(){ return this.basic.get('motherName') as FormControl<string>;}
get genderCtrl()     { return this.basic.get('gender')     as FormControl<string>; }
get birthDateCtrl()  { return this.basic.get('birthDate')  as FormControl<string>; }
get nationalityCtrl(){ return this.basic.get('nationality')  as FormControl<string>; }
get materialStatusCtrl(){ return this.basic.get('materialStatus')  as FormControl<string>; }
get dependencesCtrl(){  return this.basic.get('dependences')  as FormControl<string>; }
// الحقول داخل details

get jobTitleCtrl()   { return this.details.get('jobTitle')   as FormControl<string>; }
get paperFileNumberCtrl() { return this.details.get('paperFileNumber') as FormControl<string>; }
get collageCtrl()         { return this.details.get('collage')         as FormControl<string>; }
get educationCtrl()       { return this.details.get('education')       as FormControl<string>; }
get sourceAcadimicQualificationCtrl()       { return this.details.get('sourceAcadimicQualification')       as FormControl<string>; }
get dateQualificationCtrl()       { return this.details.get('dateQualification')      as FormControl<string>; }
get detailsQualificationCtrl()       { return this.details.get('detailsQualification')       as FormControl<string>; }

///// حقول داخل ال workdetails
get decisionStartCtrl()       { return this.workdetails.get('decisionStart')       as FormControl<string>; }
get workDateCtrl()       { return this.workdetails.get('workDate')       as FormControl<Date | null>; }
get placeActionWorkCtrl()       { return this.workdetails.get('placeActionWork')       as FormControl<string>; }
get mainDeptCodeCtrl() { return this.workdetails.get('mainDeptCode') as FormControl<string>; }
get subDeptCodeCtrl()  { return this.workdetails.get('subDeptCode')  as FormControl<string>; }

get dateActionWorkCtrl()       { return this.workdetails.get('dateActionWork')       as FormControl<Date | null>; }
get appointmentTypeCtrl()       { return this.workdetails.get('appointmentType')       as FormControl<string>; }
get jobCategoryCtrl()       { return this.workdetails.get('jobCategory')       as FormControl<string>; }
get jobAttributeCtrl()       { return this.workdetails.get('jobAttribute')       as FormControl<string>; }
get startingSalaryCtrl()       { return this.workdetails.get('startingSalary')       as FormControl<string>; }
get notesCtrl()       { return this.workdetails.get('notes')       as FormControl<string>; }


//////personals
get placeBirthCtrl()       { return this.personals.get('placeBirth')       as FormControl<string>; }
get centralSecretaionCtrl()       { return this.personals.get('centralSecretaion')       as FormControl<string>; }
get familyRegistrationCtrl()       { return this.personals.get('familyRegistration')       as FormControl<string>; }
get nationalNumberCtrl()       { return this.personals.get('nationalNumber')       as FormControl<string>; }
get idNumberCtrl()       { return this.personals.get('idNumber')       as FormControl<string>; }
get bloodTypeCtrl()       { return this.personals.get('bloodType')       as FormControl<string>; }

////communications
get permenentAddressCtrl()       { return this.communication.get('permenentAddress')       as FormControl<string>; }
get residenceCtrl()       { return this.communication.get('residence')       as FormControl<string>; }
get phoneNumberCtrl()       { return this.communication.get('phoneNumber')       as FormControl<string>; }
get whatsappNumberCtrl()       { return this.communication.get('whatsappNumber')       as FormControl<string>; }
get emailCtrl()       { return this.communication.get('email')       as FormControl<string>; }
get emergencyNameCtrl()   { return this.communication.get('emergencyName')       as FormControl<string>; } // الاسم للطوارئ
get emergencyContentRelationCtrl(){ return this.communication.get('emergencyContentRelation')as FormControl<string>;} //صلة القرابة
get emergencyPhone1Ctrl(){return this.communication.get('emergencyPhone1') as FormControl<string>; }
get emergencyPhone2Ctrl(){   return this.communication.get('emergencyPhone2') as FormControl<string>; } 


//// currentworkdetails
// get currentSalaryCtrl()       { return this.currentworkdetails.get('currentSalary')       as FormControl<string>; }
// get statusWorkCtrl()       { return this.currentworkdetails.get('statusWork')       as FormControl<string>; }
// get dateStatusWorkCtrl()       { return this.currentworkdetails.get('dateStatusWork')       as FormControl<string>; }
// get currentJoblocationCtrl()       { return this.currentworkdetails.get('currentJoblocation')       as FormControl<string>; }
// get currentDecisionAppointmentCtrl()       { return this.currentworkdetails.get('currentDecisionAppointment')       as FormControl<string>; }
// get datecurrentDecisionAppointmentCtrl()       { return this.currentworkdetails.get('datecurrentDecisionAppointment')       as FormControl<string>; }










    // workDate:        new FormControl<Date | null>(null, [Validators.required]),

get nationalityDisplay(): string {
  const ctrl = this.basic.get('nationality') as FormControl<string[]>;
  const list = ctrl?.value ?? [];
  const cleaned = list.filter(v => v !== OTHER_VALUE); // شِل "غير ذلك" المؤقتة
  return cleaned.length > 0 ? cleaned.join('، ') : 'اختر جنسية واحدة أو أكثر';
}

  // —— وظائف مساعدة ——
  private findEmployee(id: string): Employee | undefined {
    return this.store.list().find(e => e.id === id);
  }


  private patchForm(emp: Employee) {


    // ✔️ فك التابع قبل patchValue
  const parsed: ParsedPlace = this.parsePlaceActionWork(emp.placeActionWork);

  // ✔️ حدّث لائحة الفروع قبل تعبئة subDeptCode
  const dept = this.departments.find(d => d.code === parsed.main);
  this.filteredSubs = dept?.subs ?? [];


  this.form.patchValue({
    
    basic: {
      firstName:  emp.firstName,
      lastName:   emp.lastName,
      fatherName: emp.fatherName,
      motherName: emp.motherName,
      gender:     emp.gender,
      birthDate:  emp.birthDate,
      nationality:emp.nationality,
      materialStatus:emp.materialStatus ,
      dependences:emp.dependences,              
      // ما زالت string مع <input type="date">
    },
    details: {
      jobTitle:emp.jobTitle,
      paperFileNumber: emp.paperFileNumber,
      collage:         emp.collage,
      education:       emp.education,
sourceAcadimicQualification    :emp.sourceAcadimicQualification,
 dateQualification: emp.dateQualification,
detailsQualification:emp.detailsQualification,
      // residence:       emp.residence,
    },

    personals: {

 placeBirth  :emp.placeBirth    ,
 centralSecretaion  :emp.centralSecretaion,
 familyRegistration  :emp.familyRegistration,
 nationalNumber  :  emp.nationalNumber,
 idNumber :     emp.idNumber,
 bloodType : emp.bloodType,
      
    },
    workdetails:{
  decisionStart   : emp.decisionStart,
   workDate   :emp.workDate,
 
   mainDeptCode: parsed.main ?? '',
      subDeptCode:  parsed.sub  ?? '',

      // اختياري: احتفظ بالأصل إن أردت عرضه فقط
      placeActionWork: emp.placeActionWork ?? '',
 dateActionWork:emp.dateActionWork,
  appointmentType:emp.appointmentType,
 jobCategory: emp.jobCategory,
 jobAttribute:emp.jobAttribute,
 startingSalary:emp.startingSalary,
 notes:emp.notes, 
    },
    communication:{
  permenentAddress:emp.permenentAddress,
residence   :emp.residence,
 phoneNumber:emp.phoneNumber,
 whatsappNumber:emp.whatsappNumber,
email:emp.email,
 emergencyName: emp.emergencyName,
emergencyContentRelation: emp.emergencyContentRelation,
 emergencyPhone1:emp.emergencyPhone1,
 emergencyPhone2:emp.emergencyPhone2 ,



    },

//     currentworkdetails:{

//    currentSalary:emp.currentSalary,
// statusWork:emp.statusWork,
//  dateStatusWork:emp.dateStatusWork,
//  currentJoblocation:emp.currentJoblocation ,
//  currentDecisionAppointment:emp.currentDecisionAppointment,
//  datecurrentDecisionAppointment:emp.datecurrentDecisionAppointment,



//     }

    //// currentworkdetails





          // workDate:        emp.workDate ? new Date(emp.workDate as any) : null, // Date للـ datepicker

  });
}



private parsePlaceActionWork(value: string | null | undefined): ParsedPlace {
  if (!value) return {};
  const v = value.trim();

  if (v.includes('|')) {
    const [mainRaw, subRaw] = v.split('|', 2).map(s => s.trim());
    const mainOk = DEPARTMENTS.some(d => d.code === mainRaw);
    const subOk  = mainOk
      ? (DEPARTMENTS.find(d => d.code === mainRaw)!.subs.some(s => s.code === subRaw))
      : false;

    return {
      main: mainOk ? mainRaw : undefined,
      sub:  subOk  ? subRaw  : undefined,
    };
  }

  // حالة "MAIN" فقط
  const mainOk = DEPARTMENTS.some(d => d.code === v);
  return { main: mainOk ? v : undefined };
}

private composePlaceActionWork(main: string | null, sub: string | null): string {
  return [main, sub].filter(Boolean).join('|'); // "CENTRAL|CENTRAL-IT" أو "ELECTRIC"
}



  submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const { basic, details ,personals , workdetails,communication,} = this.form.getRawValue() as any;

 const placeActionWork = this.composePlaceActionWork(
    workdetails.mainDeptCode || null,
    workdetails.subDeptCode  || null
  );

  const payload: NewEmployee = {
    // دمج المجموعتين في جسم واحد
    ...basic,
    ...details,
    ...personals,
    ...workdetails,
    ...communication,

     decisionStart:   workdetails.decisionStart,
    workDate:        workdetails.workDate,
    dateActionWork:  workdetails.dateActionWork,
    appointmentType: workdetails.appointmentType,
    jobCategory:     workdetails.jobCategory,
    jobAttribute:    workdetails.jobAttribute,
    startingSalary:  workdetails.startingSalary,
    notes:           workdetails.notes,

    placeActionWork, // ✅ القيمة التي سيحفظها الموديل

  };
  

  if (this.editingId) {
    const patch: EmployeeUpdate = { id: this.editingId, ...payload };
    const updated = this.store.update(patch);
    console.log('✅ Updated:', updated);
  } else {
    const saved = this.store.add(payload);
    console.log('✅ Added:', saved);
    this.editingId = saved.id;
  }

  this.router.navigate(['/employees']);
}

}




export function strictIsoBirthdateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null; // اترك required يتكفل بالفراغ

  // 1) تحقق من الصيغة YYYY-MM-DD
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return { invalidDate: true };

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);

  // نطاقات أولية
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return { invalidDate: true };

  // 2) أنشئ التاريخ وتأكد من التطابق
  const dt = new Date(y, mo - 1, d);
  const same =
    dt.getFullYear() === y &&
    dt.getMonth() === mo - 1 &&
    dt.getDate() === d;

  if (!same) return { invalidDate: true };

  // 3) ليس في المستقبل (اختياري)
  const today = new Date();
  // صفّر وقت اليوم للمقارنة باليوم فقط
  today.setHours(0,0,0,0);
  if (dt > today) return { futureDate: true };

  return null;
}




//this file for add employee test on git