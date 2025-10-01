// import { Employee } from '../services/local-employees.service';
// import { EmploymentChange } from '../models/employment-change';


// // اجلب التبدلات من الـ Mock Service

// // طبّق deriveCurrentState لتحديث العرض (وليس قاعدة البيانات الأساسية).
// export function deriveCurrentState(base: Employee, changes: EmploymentChange[]): Employee {
//   const current: Employee = { ...base };
//   const sorted = [...changes].sort((a,b)=> a.effectiveFrom.getTime()-b.effectiveFrom.getTime());

//   for (const c of sorted) {


//     // if (c.newJobTitle        != null) current.currentJobTitle        = c.newJobTitle;
//     // if (c.newJobCategory     != null) current.currentJobCategory     = c.newJobCategory;
//     // if (c.newJobAttribute    != null) current.currentJobAttribute    = c.newJobAttribute;
//     // if (c.newAppointmentType != null) current.currentDecisionAppointment = c.newAppointmentType;
//     // if (c.newSalary          != null) current.currentSalary   = String(c.newSalary);
//     // if (c.newPlaceCode       != null) current.currentJoblocation = c.newPlaceCode;
//     // if (c.newdecisionappointment != null) current.currentDecisionAppointment = c.newdecisionappointment;
//     //  if (c.newdecisiondate != null) current.datecurrentDecisionAppointment = c.newdecisiondate as any;
    
//     // derive-current.ts
// if (c.newJobTitle            != null) current.currentJobTitle         = c.newJobTitle;
// if (c.newJobCategory         != null) current.currentJobCategory      = c.newJobCategory;
// if (c.newJobAttribute        != null) current.currentJobAttribute     = c.newJobAttribute;
// if (c.newAppointmentType     != null) current.currentappointmentType  = c.newAppointmentType;  // ✅
// if (c.newSalary              != null) current.currentSalary           = String(c.newSalary);
// if (c.newPlaceCode           != null) current.currentJoblocation      = c.newPlaceCode;
// if (c.newdecisionappointment != null) current.currentDecisionAppointment = c.newdecisionappointment; // ✅
// if (c.newdecisiondate        != null) current.datecurrentDecisionAppointment = new Date(c.newdecisiondate as any); // ✅


//     if (c.type === 'STATUS_UPDATE' && c.reason) {
//       current.statusWork = c.reason;
//       current.dateStatusWork = c.effectiveFrom as any;
//     }
//   }
//   return current;
// }



import { Employee } from '../services/local-employees.service';
import { EmploymentChange } from '../models/employment-change';

// اشتقّ لقطة "حالية" من الأساس + التبدلات (لا نعدّل الأساس)
export function deriveCurrentState(base: Employee, changes: EmploymentChange[]): Employee {
  const current: Employee = { ...base }; // بدل {.base}

  const sorted = [...(changes || [])]    //  بدل [.changes]
    .filter(Boolean)
    .sort((a, b) =>
      new Date(a.effectiveFrom as any).getTime() - new Date(b.effectiveFrom as any).getTime()
    );

  for (const c of sorted) {
    if (c.newJobTitle        != null && c.newJobTitle        !== '') current.currentJobTitle        = c.newJobTitle;
    if (c.newJobCategory     != null && c.newJobCategory     !== '') current.currentJobCategory     = c.newJobCategory;
    if (c.newJobAttribute    != null && c.newJobAttribute    !== '') current.currentJobAttribute    = c.newJobAttribute;

    //  التصحيح هنا: نوع التعيين الحالي
    if (c.newAppointmentType != null && c.newAppointmentType !== '') current.currentappointmentType = c.newAppointmentType;

    if (c.newSalary          != null)                                  current.currentSalary          = String(c.newSalary);
    if (c.newPlaceCode       != null && c.newPlaceCode       !== '')   current.currentJoblocation     = c.newPlaceCode;

    // قرار/تاريخ الحالة الحالية (أنت أصلاً تحفظهم بهذا الاسم في الخدمة)
    if (c.newdecisionappointment != null && c.newdecisionappointment !== '')
      current.currentDecisionAppointment = c.newdecisionappointment;
    if (c.newdecisiondate != null)
      current.datecurrentDecisionAppointment = new Date(c.newdecisiondate as any);

    // مثال لو أردت عكس حالة عامة
    if (c.type === 'STATUS_UPDATE' && c.reason) {
      current.statusWork = c.reason;
      current.dateStatusWork = c.effectiveFrom as any;
    }
  }

  return current;
}
