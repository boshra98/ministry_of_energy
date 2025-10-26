

import { Employee, NewEmployee } from '../../../../src/app/services/local-employees.service';
import { EmployeeForm } from '../../../../src/app/shared/types/employee-form.type';
import { OTHER_VALUE } from '../../../../src/app/shared/constants';
import { FormArray, AbstractControl, FormGroup, FormControl, Validators } from '@angular/forms';




function toISO(d?: Date | null) {
  return d ? d.toISOString().slice(0, 10) : null; // yyyy-mm-dd
}

/** يبني مسار مكان العمل من مستويات مختارة */
export function buildWorkplacePathFromArray(codes: Array<string | null | undefined>): string | null {
  const arr = (codes ?? []).map(v => (v ?? '').trim()).filter(Boolean);
  return arr.length ? arr.join('|') : null;
}

/** تقسيم المسار إلى مستويات (اختياري للاستخدام عند التحرير) */
export function splitWorkplaceAny(path?: string | null): string[] {
  if (!path) return [];
  return String(path)
    .split(/[|/>.]/) // يقبل | أو / أو > أو .
    .map(s => s.trim())
    .filter(Boolean);
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
  const placeLevelsFA = form.get('workdetails.placeLevels') as FormArray<FormControl<string>>;
  const placeCodes = (placeLevelsFA?.value ?? []).map((x: string) => (x ?? '').trim()).filter(Boolean);
  const placeActionWork = buildWorkplacePathFromArray(placeCodes); // "CODE1|CODE2|..."


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

    jobTitle:           workdetails.jobTitle,
    decisionStart:      workdetails.decisionStart,
    decisionAttribute:  workdetails.decisionAttribute,
    workDate:           workdetails.workDate,
    dateActionWork:     workdetails.dateActionWork,
    appointmentType:    workdetails.appointmentType,
    jobCategory:        workdetails.jobCategory,
    jobAttribute:       workdetails.jobAttribute,
    startingSalary:     workdetails.startingSalary,
    notes:              workdetails.notes,
    statusWork:         workdetails.statusWork,
    dateStatusWork:     workdetails.dateStatusWork,

    placeActionWork,

        ...currentMapped,


    // تخصيصات
    nationality: cleanNationalities(basic.nationality),

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

function setPlaceLevelsFromPath(form: EmployeeForm, path?: string | null) {
  const codes = splitWorkplaceAny(path); // string[]
  const fa = form.get('workdetails.placeLevels') as FormArray<FormControl<string>>;
  fa.clear();

  if (codes.length === 0) {
    // مستوى واحد فارغ على الأقل
    fa.push(new FormControl<string>('', { nonNullable: true }));
  } else {
    // ضع الأكواد الموجودة
    codes.forEach(c => fa.push(new FormControl<string>(c, { nonNullable: true })));
    // (اختياري) تمكين التعمّق لاحقًا:
    // fa.push(new FormControl<string>('', { nonNullable: true }));
  }

  // إبقاء النص متزامنًا مع المصفوفة
  const pathText = buildWorkplacePathFromArray(codes);
  (form.get('workdetails.placeActionWork') as FormControl<string | null>)
    .setValue(pathText, { emitEvent: false });
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
        placeActionWork: emp.placeActionWork ?? null,   //  النص
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

    setPlaceLevelsFromPath(form, emp.placeActionWork ?? null);


}
/** (اختياري) ملء مستويات الشجرة من مسار placeActionWork */ 


