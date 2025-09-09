// models/departments.ts
export interface SubDept { code: string; name: string; }
export interface Dept { code: string; name: string; subs: SubDept[]; }

export const DEPARTMENTS: Dept[] = [
  {
    code: 'CENTRAL',
    name: 'الإدارة المركزية',
    subs: [
      { code: 'CENTRAL-OFFICE', name: 'مدير المكتب الوزاري' },
      { code: 'CENTRAL-DIWAN',  name: 'الديوان العام' },
      { code: 'CENTRAL-IT',     name: 'مديرية التقانة' },
      { code: 'CENTRAL-DEV',    name: 'مديرية التنمية' },
    ]
  },
  {
    code: 'WATER',
    name: 'إدارة المياه',
    subs: [
      { code: 'WATER-PWS', name: 'المؤسسة العامة للمياه الشرب والصرف الصحي' },
      { code: 'WATER-DAM', name: 'المؤسسة العامة لسد الفرات' },

    ]
  },
  { code: 'ELECTRIC', name: 'إدارة الكهرباء', subs: [
    { code: 'ELECTRIC-PWS', name: 'المؤسسة العامة للكهرباء' },
      { code: 'ELECTRIC-DAM', name: 'مديرية العامة  للكهرباء' },


  ] },
  { code: 'OIL',      name: 'إدارة النفط',     subs: [] },
];
