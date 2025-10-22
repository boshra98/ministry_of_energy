// models/lookup.models.ts
export type LookupKey =
  | 'GENDERS'
  | 'BLOOD_TYPES'
  | 'MARITAL_STATUS'
  | 'EMERGENCY_RELATIONS'
  | 'JOB_TITLES'
  | 'EDUCATIONS'
  | 'JOB_ATTRIBUTE'
  | 'JOB_CATEGORY'
  | 'DECISION_ATTRIBUTE'
  | 'APPOINTMENT_TYPES'
  | 'NATIONALITIES';

export interface LookupOption {
  id: string;          // UUID
  value: string;       // قيمة مختصرة (machine)
  label: string;       // تسمية عربية (UI)
  locked?: boolean;    // عناصر افتراضية لا تُحذف
  order?: number;      // ترتيب لجرّ/إفلات
}

//ملاحظة” (locked) هي الافتراضيات التي لا تريد السماح بحذفها، لكن يمكن تعديل تسميتها إن رغبت.