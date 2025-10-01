// import { Employee, NewEmployee } from '../../../../src/app/services/local-employees.service';
// import { EmployeeForm } from '../../../../src/app/shared/types/employee-form.type';
// import { OTHER_VALUE } from '../../../../src/app/shared/constants';

// // يبني مسار مكان العمل من مستويات مختارة
// export function buildWorkplacePath(...levels: (string | null | undefined)[]): string | null {
//   const arr = levels.map(v => (v ?? '').trim()).filter(Boolean);
//   return arr.length ? arr.join('|') : null;
// }

// // ينظّف الجنسيات (يشيل "غير ذلك" والقيمة المؤقتة)
// function cleanNationalities(raw: string[] | null | undefined): string[] {
//   const list = Array.isArray(raw) ? raw : [];
//   return list
//     .map(v => (v || '').trim())
//     .filter(v => v && v !== OTHER_VALUE && v !== 'غير ذلك');
// }

// /** من الـForm → payload للحفظ في الخدمة */
// export function formToNewEmployee(form: EmployeeForm): NewEmployee {
//   const v = form.getRawValue();

//   const placeActionWork = buildWorkplacePath(
//     v.workdetails.level1Code,
//     v.workdetails.level2Code,
//     v.workdetails.level3Code,
//     v.workdetails.level4Code
//   );

//   return {
//     // basic
//     firstName:  v.basic.firstName,
//     lastName:   v.basic.lastName,
//     fatherName: v.basic.fatherName,
//     motherName: v.basic.motherName,
//     gender:     v.basic.gender,
//     birthDate:  v.basic.birthDate,   // خدمتك تتوقع string

//     nationality:   cleanNationalities(v.basic.nationality),
//     materialStatus:v.basic.materialStatus,
//     dependences:   v.basic.dependences,

//     // personals
//     placeBirth:        v.personals.placeBirth,
//     centralSecretaion: v.personals.centralSecretaion,
//     familyRegistration:v.personals.familyRegistration,
//     nationalNumber:    v.personals.nationalNumber,
//     idNumber:          v.personals.idNumber,
//     bloodType:         v.personals.bloodType,

//     // communication
//     permenentAddress: v.communication.permenentAddress,
//     residence:        v.communication.residence,
//     phoneNumber:      v.communication.phoneNumber,
//     whatsappNumber:   v.communication.whatsappNumber,
//     email:            v.communication.email,
//     emergencyName:    v.communication.emergencyName,
//     emergencyContentRelation: v.communication.emergencyContentRelation,
//     emergencyPhone1:  v.communication.emergencyPhone1,
//     emergencyPhone2:  v.communication.emergencyPhone2,

//     // details
//     paperFileNumber: v.details.paperFileNumber,
//     collage:         v.details.collage,
//     education:       v.details.education,
//     sourceAcadimicQualification: v.details.sourceAcadimicQualification,
//     dateQualification: v.details.dateQualification, // خزنها نص
//     detailsQualification: v.details.detailsQualification,
//     jobTitle:        v.details.jobTitle,

//     // workdetails
//     decisionStart:   v.workdetails.decisionStart,
//     workDate:        v.workdetails.workDate,       // تبقى Date|null (حسب واجهتك الحالية)
//     dateActionWork:  v.workdetails.dateActionWork, // Date|null
//     appointmentType: v.workdetails.appointmentType,
//     jobCategory:     v.workdetails.jobCategory,
//     jobAttribute:    v.workdetails.jobAttribute,
//     startingSalary:  v.workdetails.startingSalary,
//     notes:           v.workdetails.notes,

//     // من مستويات الشجرة
//     placeActionWork,
//   };
// }

// /** من الـModel → تعبئة الـForm (للتعديل/العرض) */
// export function employeeToForm(emp: Employee, form: EmployeeForm): void {
//   form.patchValue({
//     basic: {
//       firstName:  emp.firstName,
//       lastName:   emp.lastName,
//       fatherName: emp.fatherName,
//       motherName: emp.motherName,
//       gender:     emp.gender,
//       birthDate:  emp.birthDate, // كان string
//       nationality: emp.nationality ?? [],
//       materialStatus: emp.materialStatus ?? '',
//       dependences:    emp.dependences ?? '',
//     },

//     personals: {
//       placeBirth:        emp.placeBirth ?? '',
//       centralSecretaion: emp.centralSecretaion ?? '',
//       familyRegistration:emp.familyRegistration ?? '',
//       nationalNumber:    emp.nationalNumber ?? '',
//       idNumber:          emp.idNumber ?? '',
//       bloodType:         emp.bloodType ?? '',
//     },

//     communication: {
//       permenentAddress: emp.permenentAddress ?? '',
//       residence:        emp.residence ?? '',
//       phoneNumber:      emp.phoneNumber ?? '',
//       whatsappNumber:   emp.whatsappNumber ?? '',
//       email:            emp.email ?? '',
//       emergencyName:    emp.emergencyName ?? '',
//       emergencyContentRelation: emp.emergencyContentRelation ?? '',
//       emergencyPhone1:  emp.emergencyPhone1 ?? '',
//       emergencyPhone2:  emp.emergencyPhone2 ?? '',
//     },

//     details: {
//       paperFileNumber:          emp.paperFileNumber ?? '',
//       collage:                  emp.collage ?? '',
//       education:                emp.education ?? '',
//       sourceAcadimicQualification: emp.sourceAcadimicQualification ?? '',
//       dateQualification:        emp.dateQualification,
//       detailsQualification:     emp.detailsQualification ?? '',
//       jobTitle:                 emp.jobTitle ?? '',
//     },

//     workdetails: {
//       decisionStart:   emp.decisionStart ?? '',
//       workDate:        emp.workDate ?? null,
//       dateActionWork:  emp.dateActionWork ?? null,
//       appointmentType: emp.appointmentType ?? '',
//       jobCategory:     emp.jobCategory ?? '',
//       jobAttribute:    emp.jobAttribute ?? '',
//       startingSalary:  emp.startingSalary ?? '',
//       notes:           emp.notes ?? '',

//       // سنملأ level1..4 في الكومبوننت عبر parse للشجرة
//       placeActionWork: emp.placeActionWork ?? '',
//     },
//   }, { emitEvent: false });
// }

import { Employee, NewEmployee } from '../../../../src/app/services/local-employees.service';
import { EmployeeForm } from '../../../../src/app/shared/types/employee-form.type';
import { OTHER_VALUE } from '../../../../src/app/shared/constants';


/** يبني مسار مكان العمل من مستويات مختارة */
export function buildWorkplacePath(
  ...levels: (string | null | undefined)[]
): string | null {
  const arr = levels.map(v => (v ?? '').trim()).filter(Boolean);
  return arr.length ? arr.join('|') : null;
}

/** تقسيم المسار إلى مستويات (اختياري للاستخدام عند التحرير) */
export function splitWorkplacePath(path?: string | null): (string | null)[] {
  if (!path) return [null, null, null, null];
  const codes = String(path)
    .split(/[|/>]/) // يقبل أي فاصل شائع
    .map(s => s.trim())
    .filter(Boolean);
  return [codes[0] ?? null, codes[1] ?? null, codes[2] ?? null, codes[3] ?? null];
}

/** تنظيف الجنسيات (إزالة القيم المؤقتة) */
function cleanNationalities(raw: string[] | null | undefined): string[] {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map(v => (v || '').trim())
    .filter(v => v && v !== OTHER_VALUE && v !== 'غير ذلك');
}

/** من الـForm → Payload للحفظ في الخدمة */
export function formToNewEmployee(form: EmployeeForm): NewEmployee {
  const { basic, personals, communication, details, workdetails  , currentworkdetails} = form.getRawValue();

  // استبعد مفاتيح الشجرة، واحتفظ بالباقي للـ payload
  const { level1Code, level2Code, level3Code, level4Code, ...workRest } = workdetails;
 const currentMapped = {
    currentJoblocation:         currentworkdetails.currentJoblocation,
    currentDecisionAppointment: currentworkdetails.currentDecisionAppointment,
    datecurrentDecisionAppointment: currentworkdetails.datecurrentDecisionAppointment,
    currentSalary:              currentworkdetails.currentSalary,
    currentJobTitle:            currentworkdetails.currentjobtitle as any,      // ← تطابق خدمة الموظف
    currentJobCategory:         currentworkdetails.currentjobcategory as any,
    currentJobAttribute:        currentworkdetails.currentjobattribute as any,
    currentappointmentType:     currentworkdetails.currentappointmentType as any, // لاحظ الـ a الصغيرة عندك
  };

  return {
  // مجموعات 1:1 باستخدام spread
  ...basic,
  ...personals,
  ...communication,
  ...details,
  ...workRest,
  ...currentMapped,

  // تخصيصات
  nationality: cleanNationalities(basic.nationality),
  placeActionWork: buildWorkplacePath(level1Code, level2Code, level3Code, level4Code),
  
};
}

/** من الـModel → تعبئة الـForm (للتعديل/العرض) */
export function employeeToForm(emp: Employee, form: EmployeeForm): void {
  form.patchValue(
    {
      basic: {
        firstName: emp.firstName,
        lastName: emp.lastName,
        fatherName: emp.fatherName,
        motherName: emp.motherName,
        gender: emp.gender,
        birthDate: emp.birthDate ?? null,               // Date|null
        nationality: emp.nationality ?? [],
        materialStatus: emp.materialStatus ?? '',
        dependences: emp.dependences ?? '',
      },
      personals: {
        placeBirth: emp.placeBirth ?? '',
        centralSecretaion: emp.centralSecretaion ?? '',
        familyRegistration: emp.familyRegistration ?? '',
        nationalNumber: emp.nationalNumber ?? '',
        idNumber: emp.idNumber ?? '',
        bloodType: emp.bloodType ?? '',
      },
      communication: {
        permenentAddress: emp.permenentAddress ?? '',
        residence: emp.residence ?? '',
        phoneNumber: emp.phoneNumber ?? '',
        whatsappNumber: emp.whatsappNumber ?? '',
        email: emp.email ?? '',
        emergencyName: emp.emergencyName ?? '',
        emergencyContentRelation: emp.emergencyContentRelation ?? '',
        emergencyPhone1: emp.emergencyPhone1 ?? '',
        emergencyPhone2: emp.emergencyPhone2 ?? '',
      },
      details: {
        paperFileNumber: emp.paperFileNumber ?? '',
        collage: emp.collage ?? '',
        education: emp.education ?? '',
        sourceAcadimicQualification: emp.sourceAcadimicQualification ?? '',
        dateQualification: emp.dateQualification ?? null, // Date|null
        detailsQualification: emp.detailsQualification ?? '',
        jobTitle: emp.jobTitle ?? '',
      },
      workdetails: {
        decisionStart: emp.decisionStart ?? '',
        decisionAttribute:emp.decisionAttribute ?? '',
        workDate: emp.workDate ?? null,
        dateActionWork: emp.dateActionWork ?? null,
        appointmentType: emp.appointmentType ?? '',
        jobCategory: emp.jobCategory ?? '',
        jobAttribute: emp.jobAttribute ?? '',
        startingSalary: emp.startingSalary ?? '',
        notes: emp.notes ?? '',

        // نبقي placeActionWork كما هو؛ تعبئة مستويات الشجرة اختيارية
        placeActionWork: emp.placeActionWork ?? '',

        // الحقول اللاحقة (الحالة الحالية):
        statusWork: emp.statusWork ?? '',
        dateStatusWork: emp.dateStatusWork ?? null,
        
      },

      currentworkdetails:{

        currentJoblocation: emp.currentJoblocation ?? '',
        currentDecisionAppointment: emp.currentDecisionAppointment ?? '',
        datecurrentDecisionAppointment: emp.datecurrentDecisionAppointment ?? null,
        currentSalary: emp.currentSalary ?? '',
        // currentWorkplace: emp.currentWorkPlace ?? '',
        currentjobtitle: emp.currentJobTitle ?? null,
        currentjobcategory: emp.currentJobCategory ?? null,
        currentjobattribute: emp.currentJobAttribute ?? null,
        currentappointmentType: emp.currentappointmentType ?? '',
        

      }



    },
    { emitEvent: false }
  );
}


/** (اختياري) ملء مستويات الشجرة من مسار placeActionWork */
export function fillWorkplaceLevelsFromPath(form: EmployeeForm, path?: string | null): void {
  const [l1, l2, l3, l4] = splitWorkplacePath(path);
  form.controls.workdetails.patchValue(
    {
      level1Code: l1 ?? '',
      level2Code: l2 ?? '',
      level3Code: l3 ?? null,
      level4Code: l4 ?? null,
    },
    { emitEvent: false }
  );
}
