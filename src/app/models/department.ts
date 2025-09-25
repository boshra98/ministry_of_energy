// models/departments.ts
// export interface SubDept { code: string; name: string; }
// export interface Dept { code: string; name: string; subs: SubDept[]; }

// export const DEPARTMENTS: Dept[] = [
//   {
//     code: 'CENTRAL',
//     name: 'الإدارة المركزية',
//     subs: [
//       { code: 'CENTRAL-OFFICE', name: 'مدير المكتب الوزاري' },
//       { code: 'CENTRAL-DIWAN',  name: 'الديوان العام' },
//       { code: 'CENTRAL-IT',     name: 'مديرية التقانة' },
//       { code: 'CENTRAL-DEV',    name: 'مديرية التنمية' },
//     ]
//   },
//   {
//     code: 'WATER',
//     name: 'إدارة المياه',
//     subs: [
//       { code: 'WATER-PWS', name: 'المؤسسة العامة للمياه الشرب والصرف الصحي' },
//       { code: 'WATER-DAM', name: 'المؤسسة العامة لسد الفرات' },

//     ]
//   },
//   { code: 'ELECTRIC', name: 'إدارة الكهرباء', subs: [
//     { code: 'ELECTRIC-PWS', name: 'المؤسسة العامة للكهرباء' },
//    { code: 'ELECTRIC-DAM', name: 'مديرية العامة  للكهرباء' },


//   ] },
//   { code: 'OIL',      name: 'إدارة النفط',     subs: [] },
// ];




// models/departments.ts
export interface OrgNode {
  code: string;
  name: string;
  subs?: OrgNode[]; // تسمح بعمق غير محدود
}

export const DEPARTMENTS: OrgNode[] = [
  {
    code: 'CENTRAL',
    name: 'الإدارة المركزية',
    subs: [
      {
        code: 'CENTRAL-OFFICE',
        name: 'مدير المكتب الوزاري',
        subs: [
          {
            code: 'CENTRAL-OFFICE-DAM',
            name: 'دمشق',
            subs: [
              { code: 'CENTRAL-OFFICE-DAM-F5', name: ' دائرة الشبكات' },
              { code: 'CENTRAL-OFFICE-DAM-F4', name: 'دائرة المعلوماتية' },
             { code: 'CENTRAL-OFFICE-DAM-F3', name: 'دائرة المحاسبة' }


            ]
          },

           {
            code: 'CENTRAL-OFFICE-HAM',
            name: 'حماة',
            subs: [
              { code: 'CENTRAL-OFFICE-DAM-F5', name: ' دائرة الشبكات' }
            ]
          }


        ]
      },
      { code: 'CENTRAL-DIWAN',
         name: 'الديوان العام' ,
        subs: [
          {
            code: 'CENTRAL-OFFICE-DAM',
            name: 'دمشق',
            subs: [
              { code: 'CENTRAL-OFFICE-DAM-F5', name: ' دائرة المعلوماتية' }
            ]
          }
        ]
        
        },
     { 
  code: 'CENTRAL-IT', 
  name: 'مديرية التقانة والتحول الرقمي',
  subs: [
    { 
      code: 'CENTRAL-OFFICE-DAM-INFRA', 
      name: 'دائرة البنية التحتيه ومراكز البيانات',
      subs: [
        { code: 'CENTRAL-INFRA-NETWORK', name: 'شعبة الشبكات' },
        { code: 'CENTRAL-INFRA-DATACENTER', name: 'شعبة مراكز البيانات' },
      ]
    },
    { 
      code: 'CENTRAL-OFFICE-DAM-SYSDEV', 
      name: 'دائرة تطوير المنظومات والخدمات الرقمية',
      subs: [
        { code: 'CENTRAL-SYSDEV-APPS', name: 'شعبة تطبيقات الأعمال والبوابات' },
        { code: 'CENTRAL-SYSDEV-MOBILE', name: 'شعبة تطبيقات الموبايل والقنوات متعددة الواجهات' },
      ]
    },
  ]
},


      { code: 'CENTRAL-DEV', name: 'مديرية التنمية' },
    ]
  },

  // باقي الإدارات ...

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
