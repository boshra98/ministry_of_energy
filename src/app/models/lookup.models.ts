// src/app/models/lookup.models.ts

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

/** تُستخدم داخل التطبيق بعد التطبيع (id موجود) */
export interface LookupOption {
  id: string;              // UUID بعد التطبيع
  value: string;           // القيمة التي تُحفظ في الداتا/الباكند
  label: string;           // المعروض للمستخدم
  locked?: boolean;        // يمنع الحذف
  order?: number;          // للترتيب والسحب/الإفلات
  disabled?: boolean;      // إخفاء مؤقت بدون حذف (اختياري)
  meta?: Record<string, unknown>; // بيانات إضافية مستقبلية (اختياري)
}

/** للـ seed والـ import قبل التطبيع (id غير مطلوب) */
export interface LookupSeedOption {
  value: string;
  label: string;
  locked?: boolean;
  order?: number;
  disabled?: boolean;
  meta?: Record<string, unknown>;
}
