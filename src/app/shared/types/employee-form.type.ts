import { FormControl, FormGroup, Validators, NonNullableFormBuilder , FormArray } from '@angular/forms';
import { dateNotInFutureValidator } from '../validators/date.validators';

/** RegExp مشتركة */
const NAME_RX   = /^[\p{L}\s]+$/u;  // أحرف + مسافات (أي لغة)
const DIGITS_RX = /^[0-9]+$/;

// عرّف نوع المرفق بحيث dataUrl و blobUrl اختياريتان
export type Attachment = {
  id: string;
  name: string;
  mime: string;
  size: number;
  dataUrl?: string;   // للصور
  blobUrl?: string;   // للـ PDF
  uploadedAt: string;
};

export function createQualificationGroup(/* fb: NonNullableFormBuilder */): FormGroup {
  return new FormGroup({
    paperFileNumber:         new FormControl<string>('', { nonNullable: true, validators: [Validators.pattern(/^[0-9]+$/)] }),
    collage:                 new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(200)] }),
    education:               new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    sourceAcadimicQualification: new FormControl<string>('', { nonNullable: true }),
    dateQualification:       new FormControl<Date | null>(null),
    detailsQualification:    new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(500)] }),

    //  كنترول قابل أن يكون null وبنوع يسمح بالصور/الـ PDF
    attachment:              new FormControl<Attachment | null>(null),
  });
}

// عنصر شهادة واحد
// export function createQualificationGroup(fb: NonNullableFormBuilder) {
//   return fb.group({
//     // paperFileNumber: [''],
//     paperFileNumber: ['', [Validators.pattern(/^[0-9]+$/)]],

//     collage: ['',[Validators.maxLength(200)]],
//     education: ['', Validators.required], // يختار من educations$
//     sourceAcadimicQualification: [''],
//     dateQualification: [null as Date | null],
//     detailsQualification: ['',[Validators.maxLength(500)]],
// // اضافة جديدة من اجل المرفق تبع تلشهادة
//     attachment: fb.control<{
//       id: string; name: string; mime: string; size: number; dataUrl: string; uploadedAt: string;
//     } | null>(null),

    

//   });


export type QualificationForm = ReturnType<typeof createQualificationGroup>;

// === نوع الفورم ===
export type EmployeeForm = FormGroup<{
  basic: FormGroup<{
    firstName: FormControl<string>;
    lastName: FormControl<string>;
    fatherName: FormControl<string>;
    motherName: FormControl<string>;
    gender: FormControl<string>;
    birthDate: FormControl<Date | null>;
    nationality: FormControl<string[]>;   // متعدد
    materialStatus: FormControl<string>;
    // dependences: FormControl<string>;
    wifedependences: FormControl<string >;
    childdependences: FormControl<string >;

    
  }>;

  personals: FormGroup<{
    placeBirth: FormControl<string>;
    centralSecretaion: FormControl<string>;
    familyRegistration: FormControl<string>;
    nationalNumber: FormControl<string>;
    idNumber: FormControl<string>;
    bloodType: FormControl<string>;
  }>;

  communication: FormGroup<{
    permenentAddress: FormControl<string>;
    residence: FormControl<string>;
    phoneNumber: FormControl<string>;
    whatsappNumber: FormControl<string>;
    email: FormControl<string>;
    emergencyName: FormControl<string>;
    emergencyContentRelation: FormControl<string>;
    emergencyPhone1: FormControl<string>;
    emergencyPhone2: FormControl<string>;
  }>;
 
 
  details:
   FormGroup<{
    qualifications: FormArray<QualificationForm>;
   }> ;


  workdetails: FormGroup<{
    jobTitle: FormControl<string>;
    decisionStart: FormControl<string>;
    decisionAttribute:  FormControl<string>;
    workDate: FormControl<Date | null>;
    placeLevels: FormArray<FormControl<string>>;
  placeActionWork: FormControl<string | null>;   // 👈 بدّلها إلى nullable
    dateActionWork: FormControl<Date | null>;
    appointmentType: FormControl<string>;
    jobCategory: FormControl<string>;
    jobAttribute: FormControl<string>;
    startingSalary: FormControl<string>;
    notes: FormControl<string>;
    statusWork: FormControl<string>;
    dateStatusWork: FormControl<Date | null>;
    
  }>;

  currentworkdetails: FormGroup<{
    currentJoblocation: FormControl<string>;
    currentDecisionAppointment: FormControl<string>;
    datecurrentDecisionAppointment: FormControl<Date | null>;
    currentSalary: FormControl<string>;
    // currentWorkplace: FormControl<string>;
    currentjobtitle: FormControl<string | null>;
    currentjobcategory: FormControl<string | null>;
    currentjobattribute: FormControl<string | null>;
    currentappointmentType: FormControl<string | null>;
  }>;

}>;


/** الدالة الموحّدة لإنشاء النموذج */
export function createEmployeeForm(fb: NonNullableFormBuilder): EmployeeForm {
  return fb.group({
    basic: fb.group({
      firstName: fb.control('', { validators: [Validators.required, Validators.minLength(2), Validators.pattern(NAME_RX)] }),
      lastName:  fb.control('', { validators: [Validators.required, Validators.minLength(2), Validators.pattern(NAME_RX)] }),
      fatherName:fb.control('', { validators: [Validators.required, Validators.minLength(2), Validators.pattern(NAME_RX)] }),
      motherName:fb.control('', { validators: [Validators.required, Validators.minLength(2), Validators.pattern(NAME_RX)] }),
      gender:    fb.control('', { validators: [Validators.required] }),
    //   birthDate: fb.control<Date | null>(null, { validators: [Validators.required] }),
      birthDate: fb.control<Date | null>(null, { validators: [Validators.required, dateNotInFutureValidator()] }),

      nationality: fb.control<string[]>([], { validators: [Validators.required] }),
      materialStatus: fb.control('', { validators: [Validators.required] }),
      // dependences: fb.control(''),
      wifedependences: fb.control('', { validators: [Validators.pattern(DIGITS_RX)] }),
      childdependences: fb.control('', { validators: [Validators.pattern(DIGITS_RX)] }),
    }),

    personals: fb.group({
      placeBirth:        fb.control('', { validators: [Validators.required, Validators.minLength(2), Validators.pattern(NAME_RX)] }),
      centralSecretaion: fb.control('', { validators: [Validators.required, Validators.minLength(2), Validators.pattern(NAME_RX)] }),
      familyRegistration:fb.control('', { validators: [Validators.required] }),
      nationalNumber:    fb.control('', { validators: [Validators.required, Validators.pattern(DIGITS_RX)] }),
      idNumber:          fb.control('', { validators: [Validators.required, Validators.pattern(DIGITS_RX)] }),
      bloodType:         fb.control('', { validators: [Validators.required] }),
    }),

    communication: fb.group({
      permenentAddress: fb.control('', { validators: [Validators.required] }),
      residence:        fb.control('', { validators: [Validators.required] }),
      phoneNumber:      fb.control('', { validators: [Validators.required, Validators.pattern(DIGITS_RX)] }),
      whatsappNumber:   fb.control('', { validators: [Validators.required, Validators.pattern(DIGITS_RX)] }),
      email:            fb.control('', { validators: [Validators.email] }),
      emergencyName:    fb.control(''),
      emergencyContentRelation: fb.control(''),
      emergencyPhone1:  fb.control(''),
      emergencyPhone2:  fb.control(''),
    }),

    



     details: fb.group({
      qualifications: fb.array([ createQualificationGroup() ]),
    }),


    workdetails: fb.group({

     jobTitle:                 fb.control(''),

      decisionStart: fb.control(''),
      decisionAttribute: fb.control(''),
      workDate:      fb.control<Date | null>(null, { validators: [Validators.required] }),

       placeActionWork: fb.control<string | null>(null),
    placeLevels:     fb.array<FormControl<string>>([ fb.control<string>('') ]),
      
      dateActionWork:  fb.control<Date | null>(null, { validators: [Validators.required] }),
      // appointmentType: fb.control('', { validators: [Validators.pattern(NAME_RX)] }),
      appointmentType: fb.control('', { validators: [Validators.required] }),

      jobCategory:     fb.control(''),
      // jobAttribute:    fb.control('', { validators: [Validators.pattern(NAME_RX)] }),
      jobAttribute:  fb.control(''), // value فقط

      startingSalary:  fb.control('', { validators: [Validators.pattern(DIGITS_RX)] }),
      notes:           fb.control(''),

      statusWork:                 fb.control(''),
      dateStatusWork:             fb.control<Date | null>(null),
     
    }),
  currentworkdetails: fb.group({
  currentJoblocation:         fb.control(''),
  currentDecisionAppointment: fb.control(''),
  datecurrentDecisionAppointment: fb.control<Date | null>(null),
  currentSalary:              fb.control(''),
  // currentWorkplace:           fb.control(''),
  currentjobtitle:            fb.control<string | null>(null),
  currentjobcategory:         fb.control<string | null>(null),
  currentjobattribute:        fb.control<string | null>(null),
  currentappointmentType:     fb.control<string | null>(null),
}),

  }) as EmployeeForm;
}
