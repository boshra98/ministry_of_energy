// data/lookup.seeds.ts
import { LookupKey, LookupSeedOption } from '../models/lookup.models';

// مساعد بسيط يضيف locked ويثبت الترتيب إن رغبت
const seed = (a: Array<{ value: string; label: string }>): LookupSeedOption[] =>
  a.map((x, i) => ({ value: x.value, label: x.label, locked: true, order: i }));

export const LOOKUP_SEEDS: Record<LookupKey, LookupSeedOption[]> = {
  GENDERS: seed([
    { value: 'male',   label: 'ذكر' },
    { value: 'female', label: 'أنثى' },
  ]),

  BLOOD_TYPES: seed([
    { value: 'A-', label: 'A-' }, { value: 'A+', label: 'A+' },
    { value: 'B-', label: 'B-' }, { value: 'B+', label: 'B+' },
    { value: 'AB-', label: 'AB-' }, { value: 'AB+', label: 'AB+' },
    { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
  ]),

  MARITAL_STATUS: seed([
    { value: 'single',   label: 'أعزب' },
    { value: 'married',  label: 'متزوج' },
    { value: 'divorced', label: 'مطلق' },
    { value: 'widow',    label: 'أرمل' },
  ]),

  EMERGENCY_RELATIONS: seed([
    { value: 'father',   label: 'أب' },
    { value: 'mother',   label: 'أم' },
    { value: 'brother',  label: 'أخ' },
    { value: 'son',      label: 'ابن' },
    { value: 'spouse',   label: 'زوج/زوجة' },
    { value: 'friend',   label: 'صديق' },
    { value: 'relative', label: 'قريب' },
    { value: 'other',    label: 'غير ذلك' },
  ]),

  JOB_TITLES: seed([
    { value: 'teacher',    label: 'مدرّس' },
    { value: 'accountant', label: 'محاسب' },
    { value: 'secretary',  label: 'سكرتير' },
    { value: 'developer',  label: 'مبرمج' },
  ]),

  EDUCATIONS: seed([
    { value: 'primary',   label: 'ابتدائي' },
    { value: 'middle',    label: 'اعدادي' },
    { value: 'secondary', label: 'ثانوي' },
    { value: 'bsc1',      label: 'اجازة جامعية أربع سنوات' },
    { value: 'bsc2',      label: 'اجازة جامعية خمس سنوات' },
    { value: 'bsc3',      label: 'اجازة جامعية ست سنوات' },
    { value: 'msc',       label: 'ماستر' },
    { value: 'phd',       label: 'دكتوراه' },
  ]),

  JOB_ATTRIBUTE: seed([
    { value: 'active_duty',     label: 'على رأس عمله' },
    { value: 'secondment',      label: 'ندب' },
    { value: 'unpaid_leave',    label: 'اجازة بلا راتب' },
    { value: 'paid_leave_3m',   label: 'اجازة 3 اشهر براتب' },
    { value: 'post_assignment', label: 'تحديد مركز عمل' },
    { value: 'pending_resign',  label: 'قيد الاستقالة' },
    { value: 'suspension',      label: 'كف يد' },
    { value: 'delegation',      label: 'اعارة' },
    { value: 'deemed_resigned', label: 'بحكم المستقيل' },
  ]),

  JOB_CATEGORY: seed([
    { value: 'I',   label: 'الفئة الأولى' },
    { value: 'II',  label: 'الفئة الثانية' },
    { value: 'III', label: 'الفئة الثالثة' },
    { value: 'IV',  label: 'الفئة الرابعة' },
    { value: 'V',   label: 'الفئة الخامسة' },
  ]),

  DECISION_ATTRIBUTE: seed([
    { value: 'const',       label: 'مثبت' },
    { value: 'not_const',   label: 'عقد مؤقت' },
    { value: 'not_const2',  label: 'عقد جزئي' },
    { value: 'not_const3',  label: 'عقد مرن' },
  ]),

  APPOINTMENT_TYPES: seed([
    { value: 'COMPETITION',        label: 'تعيين بموجب مسابقة' },
    { value: 'ENGINEERS',          label: 'فرز مهندسين' },
    { value: 'GRADUATES',          label: 'فرز خريجين معاهد' },
    { value: 'YOUTH_PROGRAM',      label: 'برنامج تشغيل الشباب' },
    { value: 'MINISTRY_CONTEST',   label: 'مسابقة وزارة التنمية' },
    { value: 'SPORTS_CHAMPION',    label: 'بطل رياضي' },
    { value: 'MARTYR_FAMILY',      label: 'ذوي قتلى' },
    { value: 'DISABILITY',         label: 'ذوي إعاقة' },
    { value: 'TEACHING_SERVICE',   label: 'مسابقة المسرّحين من خدمة العلم' },
    { value: 'COMPETITION_AGAIN',  label: 'تعيين بموجب مسابقة' },
    { value: 'EXAM_BASED',         label: 'تعيين بموجب اختبار' },
    { value: 'AGENCY_APPOINTMENT', label: 'تعيين بالوكالة' },
    { value: 'INDIVIDUAL_REQUEST', label: 'طلب خطي (تعيين فردي)' },
    { value: 'SELF_PROTECTION_PLAN', label: 'خطة الحماية الذاتية' },
  ]),

  NATIONALITIES: seed([
    { value: 'سوري',            label: 'سوري' },
    { value: 'فلسطيني سوري',    label: 'فلسطيني سوري' },
    { value: 'لبناني',          label: 'لبناني' },
    // … أكمل كما تريد
  ]),
};
