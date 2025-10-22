import { LookupOption } from './lookups.types';

export const GENDERS: LookupOption[] = [
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
];

export const BLOOD_TYPES: LookupOption[] = [
  { value: 'A-', label: 'A-' }, { value: 'A+', label: 'A+' },
  { value: 'B-', label: 'B-' }, { value: 'B+', label: 'B+' },
  { value: 'AB-', label: 'AB-' }, { value: 'AB+', label: 'AB+' },
  { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
];

export const MARITAL_STATUS: LookupOption[] = [
  { value: 'single',  label: 'أعزب' },
  { value: 'married', label: 'متزوج' },
    { value: 'divorced', label: 'مطلق' },
  { value: 'widow', label: 'ارمل' },

];


export const EMERGENCY_RELATIONS: LookupOption[] = [
  { value: 'father', label: 'أب' }, { value: 'mother', label: 'أم' },
  { value: 'brother', label: 'أخ' }, { value: 'son', label: 'ابن' },
  { value: 'spouse', label: 'زوج/زوجة' }, { value: 'friend', label: 'صديق' },
  { value: 'relative', label: 'قريب' }, { value: 'other', label: 'غير ذلك' },
];

export const JOB_TITLES_DEFAULT: LookupOption[] = [
  { value: 'teacher', label: 'مدرّس' },
  { value: 'accountant', label: 'محاسب' },
  { value: 'secretary', label: 'سكرتير' },
  { value: 'developer', label: 'مبرمج' },
];

export const EDUCATIONS_DEFAULT: LookupOption[] = [
  { value: 'primary',  label: 'ابتدائي' },
  { value: 'middle',   label: 'اعدادي' },
  { value: 'secondary',label: 'ثانوي' },
  { value: 'bsc1',      label: 'اجازة جامعية أربع سنوات' },
    { value: 'bsc2',      label: 'اجازة جامعية خمس سنوات' },
  { value: 'bsc3',      label: 'اجازة جامعية ست سنوات' },
  { value: 'msc',      label: 'ماستر' },
  { value: 'phd',      label: 'دكتوراه' },
];

  export const JOBATTRIBUTE_DEFAULT: LookupOption[] = 
  
 [
  { value: 'active_duty',      label: 'على رأس عمله' },
  { value: 'secondment',       label: 'ندب' },
  { value: 'unpaid_leave',     label: 'اجازة بلا راتب' },
  { value: 'paid_leave_3m',    label: 'اجازة 3 اشهر براتب' },
  { value: 'post_assignment',  label: 'تحديد مركز عمل' },
  { value: 'pending_resign',   label: 'قيد الاستقالة' },
  { value: 'suspension',       label: 'كف يد' },
  { value: 'delegation',       label: 'اعارة' },
  { value: 'deemed_resigned',  label: 'بحكم المستقيل' }
] ;


export const JOBCATEGORY_DEFAULT: LookupOption[] = [
  { value: 'I', label: 'الفئة الأولى' },     
  { value: 'II', label: 'الفئة الثانية' },   
  { value: 'III', label: 'الفئة الثالثة' },  
  { value: 'IV', label: 'الفئة الرابعة' },   
  { value: 'V', label: 'الفئة الخامسة' },   
];



export const decisionAttribute_DEFAULT: LookupOption[] = [
  { value: 'const', label: ' مثبت' },     
  { value: 'not_const', label: '   عقد مؤقت' }, 
    { value: 'not_const2', label: ' عقد جزئي' },  
  { value: 'not_const3', label: ' عقد مرن' },  
]; 


export const appointmentTypes_DEFAULT: LookupOption[] = [
  { value: 'COMPETITION', label: 'تعيين بموجب مسابقة' },
  { value: 'ENGINEERS', label: 'فرز مهندسين' },
  { value: 'GRADUATES', label: 'فرز خريجين معاهد' },
  { value: 'YOUTH_PROGRAM', label: 'برنامج تشغيل الشباب' },
  { value: 'MINISTRY_CONTEST', label: 'مسابقة وزارة التنمية' },
  { value: 'SPORTS_CHAMPION', label: 'بطل رياضي' },
  { value: 'MARTYR_FAMILY', label: 'ذوي قتلى' },
  { value: 'DISABILITY', label: 'ذوي إعاقة' },
  { value: 'TEACHING_SERVICE', label: 'مسابقة المسرّحين من خدمة العلم' },
  { value: 'COMPETITION_AGAIN', label: 'تعيين بموجب مسابقة' },
  { value: 'EXAM_BASED', label: 'تعيين بموجب اختبار' },
  { value: 'AGENCY_APPOINTMENT', label: 'تعيين بالوكالة' },
  { value: 'INDIVIDUAL_REQUEST', label: 'طلب خطي (تعيين فردي)' },
  { value: 'SELF_PROTECTION_PLAN', label: 'خطة الحماية الذاتية' },
];

