export type EmploymentChangeType =
  | 'PROMOTION'        // ترقية
  | 'SALARY_INCREASE'  // زيادة راتب
  | 'INTERNAL_MOVE'    // نقل/ندب/إلحاق
  | 'STATUS_UPDATE' //
  | 'TERMINATION'   // استقالة/تسريح/إجازة طويلة
  | 'OTHER';

export interface EmploymentChange {
  id: string;
  employeeId: string;
  type: EmploymentChangeType;
  effectiveFrom: Date;
  decisionNumber?: string;
  decisionDate?: Date;
  reason?: string;

  newJobTitle?: string;
  newJobCategory?: string;
  newJobAttribute?: string;
  newAppointmentType?: string;
  newSalary?: number;
  newPlaceCode?: string;
  newdecisionappointment?: string;
  newdecisiondate?: Date;

  createdAt: Date;
  createdBy: string;
}

//كلشي new  يعني ماتم تغييره فقط