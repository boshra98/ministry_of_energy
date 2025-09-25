import { FormControl, FormGroup, Validators, NonNullableFormBuilder } from '@angular/forms';
import { dateNotInFutureValidator } from '../validators/date.validators';

/** RegExp مشتركة */
const NAME_RX   = /^[\p{L}\s]+$/u;  // أحرف + مسافات (أي لغة)
const DIGITS_RX = /^[0-9]+$/;


// const allowed = new Set(appointmentTypes_DEFAULT.map(o => o.value));

// function oneOfAllowed(ctrl: AbstractControl<string | null>) {
//   const v = ctrl.value;
//   return v && allowed.has(v) ? null : { oneOf: true };
// }

// appointmentType: fb.control(null, { 
//   validators: [Validators.required, oneOfAllowed] 
// }),


/** ملاحظة مهمة حول التواريخ:
 * لو أنت تستخدم MatDatepicker يفضّل نخلي الحقول Date | null
 * (birthDate, workDate, dateActionWork, dateQualification, dateStatusWork, datecurrentDecisionAppointment)
 * لو عندك Validator مخصص لصيغة ISO، خليه بس للحقول النصّية.
 */

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
    dependences: FormControl<string>;
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

  details: FormGroup<{
    paperFileNumber: FormControl<string>;
    collage: FormControl<string>;
    education: FormControl<string>;
    sourceAcadimicQualification: FormControl<string>;
    dateQualification: FormControl<Date | null>;
    detailsQualification: FormControl<string>;
    jobTitle: FormControl<string>;
  }>;

  workdetails: FormGroup<{
    decisionStart: FormControl<string>;
    decisionAttribute:  FormControl<string>;
    workDate: FormControl<Date | null>;
    level1Code: FormControl<string>;
    level2Code: FormControl<string>;
    level3Code: FormControl<string | null>;
    level4Code: FormControl<string | null>;

    placeActionWork: FormControl<string>;
    dateActionWork: FormControl<Date | null>;
    appointmentType: FormControl<string>;
    jobCategory: FormControl<string>;
    jobAttribute: FormControl<string>;
    startingSalary: FormControl<string>;
    notes: FormControl<string>;

    statusWork: FormControl<string>;
    dateStatusWork: FormControl<Date | null>;
    currentJoblocation: FormControl<string>;
    currentDecisionAppointment: FormControl<string>;
    datecurrentDecisionAppointment: FormControl<Date | null>;
    currentSalary: FormControl<string>;
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
      dependences: fb.control(''),
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
      paperFileNumber:          fb.control('', { validators: [Validators.pattern(DIGITS_RX)] }),
      collage:                  fb.control('', { validators: [Validators.pattern(NAME_RX)] }),
      education:                fb.control(''),
      sourceAcadimicQualification: fb.control('', { validators: [Validators.pattern(NAME_RX)] }),
      dateQualification:        fb.control<Date | null>(null),

      detailsQualification:     fb.control('', { validators: [Validators.pattern(NAME_RX)] }),
      jobTitle:                 fb.control(''),
    }),

    workdetails: fb.group({
      decisionStart: fb.control(''),
      decisionAttribute: fb.control(''),
      workDate:      fb.control<Date | null>(null, { validators: [Validators.required] }),
      level1Code:    fb.control('', { validators: [Validators.required] }),
      level2Code:    fb.control('', { validators: [Validators.required] }),
      level3Code:    fb.control<string | null>(null),
      level4Code:    fb.control<string | null>(null),

      placeActionWork: fb.control(''),
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
      currentJoblocation:         fb.control(''),
      currentDecisionAppointment: fb.control(''),
      datecurrentDecisionAppointment: fb.control<Date | null>(null),
      currentSalary:              fb.control(''),
    }),
  }) as EmployeeForm;
}
