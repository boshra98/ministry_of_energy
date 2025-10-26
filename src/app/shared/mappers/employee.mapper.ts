

import { Employee, NewEmployee } from '../../../../src/app/services/local-employees.service';
import { EmployeeForm } from '../../../../src/app/shared/types/employee-form.type';
import { OTHER_VALUE } from '../../../../src/app/shared/constants';
import { FormArray, AbstractControl, FormGroup, FormControl, Validators } from '@angular/forms';




function toISO(d?: Date | null) {
  return d ? d.toISOString().slice(0, 10) : null; // yyyy-mm-dd
}

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

export function formToNewEmployee(form: EmployeeForm): NewEmployee {
  const { basic, personals, communication, details, workdetails, currentworkdetails } = form.getRawValue();

  // استبعد مفاتيح مستويات الشجرة

  // حرّر qualifications من الـ FormArray إلى JSON بسيط
  const fa = (form.get('details.qualifications') as FormArray) ?? new FormArray([]);
  const qualifications = fa.controls.map((ctrl: AbstractControl) => {
    const g = ctrl as FormGroup;
    const v = g.getRawValue() as any;
    return {
      paperFileNumber: v.paperFileNumber || '',
      collage: v.collage || '',
      education: v.education || '',
      sourceAcadimicQualification: v.sourceAcadimicQualification || '',
      dateQualification: toISO(v.dateQualification ?? null),
      detailsQualification: v.detailsQualification || '',
      attachment: v.attachment ?? null,              // مرّرها كما هي

    };
  });

  const currentMapped = {
    currentJoblocation:         currentworkdetails.currentJoblocation,
    currentDecisionAppointment: currentworkdetails.currentDecisionAppointment,
    datecurrentDecisionAppointment: currentworkdetails.datecurrentDecisionAppointment,
    currentSalary:              currentworkdetails.currentSalary,
    currentJobTitle:            currentworkdetails.currentjobtitle as any,
    currentJobCategory:         currentworkdetails.currentjobcategory as any,
    currentJobAttribute:        currentworkdetails.currentjobattribute as any,
    currentappointmentType:     currentworkdetails.currentappointmentType as any,
  };

  return {
    // مجموعات 1:1
    ...basic,
    ...personals,
    ...communication,
    ...workRest,
    ...currentMapped,

    // تخصيصات
    nationality: cleanNationalities(basic.nationality),
    placeActionWork: buildWorkplacePath(level1Code, level2Code, level3Code, level4Code),

    // أهم شيء: details → qualifications (مصفوفة)
    details: {
      qualifications,
    },
  };
}

type Attachment = {
  id: string;
  name: string;
  mime: string;
  size: number;
  dataUrl?: string;   // للصور
  blobUrl?: string;   // للـ PDF
  uploadedAt: string;
};


function makeQualificationGroup(init?: any): FormGroup {
  return new FormGroup({
    paperFileNumber: new FormControl(init?.paperFileNumber ?? ''),
    collage: new FormControl(init?.collage ?? '', { nonNullable: true, validators: [Validators.maxLength(200)] }),
    education: new FormControl(init?.education ?? '', { nonNullable: true, validators: [Validators.required] }),
    sourceAcadimicQualification: new FormControl(init?.sourceAcadimicQualification ?? ''),
    dateQualification: new FormControl( new Date(init.dateQualification)  ),
   
    detailsQualification: new FormControl(init?.detailsQualification ?? '', { nonNullable: true, validators: [Validators.maxLength(500)] }),
        attachment:               new FormControl<Attachment | null>(init?.attachment ?? null),

  });
}

export function employeeToForm(emp: Employee, form: EmployeeForm): void {
  // 1) باقي المجموعات كما عندك (بدون details الفردية)
  form.patchValue(
    {
      basic: {
        firstName: emp.firstName,
        lastName: emp.lastName,
        fatherName: emp.fatherName,
        motherName: emp.motherName,
        gender: emp.gender,
        birthDate: emp.birthDate ?? null,
        nationality: emp.nationality ?? [],
        materialStatus: emp.materialStatus ?? '',
        wifedependences: emp.wifedependences ?? '',
        childdependences: emp.childdependences ?? '',
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
      workdetails: {
        jobTitle: emp.jobTitle ?? '',
        decisionStart: emp.decisionStart ?? '',
        decisionAttribute: emp.decisionAttribute ?? '',
        workDate: emp.workDate ?? null,
        dateActionWork: emp.dateActionWork ?? null,
        appointmentType: emp.appointmentType ?? '',
        jobCategory: emp.jobCategory ?? '',
        jobAttribute: emp.jobAttribute ?? '',
        startingSalary: emp.startingSalary ?? '',
        notes: emp.notes ?? '',
        placeActionWork: emp.placeActionWork ?? '',
        statusWork: emp.statusWork ?? '',
        dateStatusWork: emp.dateStatusWork ?? null,
      },
      currentworkdetails: {
        currentJoblocation: emp.currentJoblocation ?? '',
        currentDecisionAppointment: emp.currentDecisionAppointment ?? '',
        datecurrentDecisionAppointment: emp.datecurrentDecisionAppointment ?? null,
        currentSalary: emp.currentSalary ?? '',
        currentjobtitle: emp.currentJobTitle ?? null,
        currentjobcategory: emp.currentJobCategory ?? null,
        currentjobattribute: emp.currentJobAttribute ?? null,
        currentappointmentType: emp.currentappointmentType ?? '',
      }
    },
    { emitEvent: false }
  );







  // 2) تعبئة qualifications (FormArray)
  const fa = form.get('details.qualifications') as FormArray;
  fa.clear();

  const d: any = (emp as any).details ?? {};
  const hasLegacy =
    d.education || d.dateQualification || d.collage || d.paperFileNumber || d.sourceAcadimicQualification || d.detailsQualification;

  const list = Array.isArray(d.qualifications) && d.qualifications.length
    ? d.qualifications
    : (hasLegacy ? [{
        paperFileNumber: d.paperFileNumber ?? '',
        collage: d.collage ?? '',
        education: d.education ?? '',
        sourceAcadimicQualification: d.sourceAcadimicQualification ?? '',
        dateQualification: d.dateQualification ?? null,
        detailsQualification: d.detailsQualification ?? '',
      }] : []);

  if (!list.length) {
    fa.push(makeQualificationGroup()); // عنصر فارغ واحد على الأقل
  } else {
    list.forEach((q: any) => fa.push(makeQualificationGroup(q)));
  }

}
/** (اختياري) ملء مستويات الشجرة من مسار placeActionWork */ 
export function fillWorkplaceLevelsFromPath(
  form: EmployeeForm, path?: string | null):
   void { const [l1, l2, l3, l4] = splitWorkplacePath(path); form.controls.workdetails.patchValue(
     { level1Code: l1 ?? '', level2Code: l2 ?? '', level3Code: l3 ?? null, level4Code: l4 ?? null, },
      { emitEvent: false } ); 
    }

