import { Injectable } from '@angular/core';



export interface Qualification {
  paperFileNumber?: string;
  collage?: string;
  education: string;                  // code من الـ lookup
  sourceAcadimicQualification?: string;
  dateQualification?: string | null;  // ISO yyyy-mm-dd (نُجهّزها في المابر)
  detailsQualification?: string;

// من اجل صورة مرفقات الشهادة العلمية
  attachment?: {
    id: string;              // uuid
    name: string;            // اسم الملف الأصلي
    mime: 'image/jpeg' | 'image/png' | 'application/pdf';
    size: number;            // بالبايت
    dataUrl: string;         // base64 Data URL (للبيئات المحلية)
    uploadedAt: string;      // ISO datetime
  } | null;

}



export type DocAttachmentType =
  | 'profile_photo'
  | 'id_card_front' | 'id_card_back'
  | 'family_record'
  | 'passport'
  | 'criminal_record'
  | 'non_employment'
  | 'appointment_order';

export interface DocAttachment {
  id: string;
  type: DocAttachmentType;
  name: string;
  mime: 'image/jpeg' | 'image/png' | 'application/pdf';
  size: number;
  dataUrl: string;       // تخزين محلي مؤقت
  uploadedAt: string;    // ISO
  note?: string;
   
  storage?: 'local' | 'remote';      // افتراضي 'local' الآن
  fileId?: string;                   // معرّف الملف على السيرفر
  remoteUrl?: string;


}

export interface EmployeeDetails {
  qualifications: Qualification[];
}
export interface Employee {
   id: string;
  childdependences: string | null | undefined;
  wifedependences: string | null | undefined;
  emergencyPhone2: string | null | undefined;
  emergencyPhone1: string | null | undefined;
  emergencyContentRelation: string | null | undefined;
  emergencyName: string | null | undefined;
  
  dateStatusWork: Date | null | undefined;
  statusWork: string | null | undefined;
  email: string | null | undefined;
  whatsappNumber: string | null | undefined;
  phoneNumber: string | null | undefined;
  permenentAddress: string | null | undefined;
  notes: string | null | undefined;
  startingSalary: string | null | undefined;
  jobAttribute: string | null | undefined;
  jobCategory: string | null | undefined;
  appointmentType: string | null | undefined;
  dateActionWork: Date | null | undefined;
  placeActionWork: string | null | undefined;
  decisionStart: string | null | undefined;
  decisionAttribute: string | null | undefined;
  bloodType: string | null | undefined;
  idNumber: string | null | undefined;
  nationalNumber: string | null | undefined;
  familyRegistration: string | null | undefined;
  centralSecretaion: string | null | undefined;
  placeBirth: string | null | undefined;
  detailsQualification?: string | null | undefined;
  dateQualification?: Date | null | undefined;
  sourceAcadimicQualification?: string | null | undefined;
  materialStatus: string | null | undefined;
  nationality: string[]| null | undefined;
  otherNationality?: string | null | undefined; //  جنسية اخرى
  education?: string | undefined;
  collage?: string | undefined;
  workDate: Date | null | undefined;
  firstName: string;
  lastName: string;
  fatherName: string;
  motherName:string;
  paperFileNumber?: string;
  gender: string;
  residence: string;
  jobTitle: string;
  birthDate: Date | null ;


  details?: EmployeeDetails;
  attachments?:DocAttachment[];




  datecurrentDecisionAppointment: Date | null | undefined;
  currentDecisionAppointment: string | null | undefined;
  currentJoblocation: string | null | undefined;
  currentSalary: string | null | undefined;
  // currentWorkPlace: string | null | undefined;
  currentJobTitle: string | null | undefined;
  currentJobCategory: string | null | undefined;
  currentJobAttribute: string | null | undefined;
  currentappointmentType: string | null | undefined;

//here all fields are optional except id, firstName, lastName, father

createdAt: Date; // ISO
updatedAt?: Date; //  أضِف هذا

}


function ensureDocAttachments(e: Partial<Employee>): DocAttachment[] {
  return Array.isArray(e.attachments) ? e.attachments : [];
}


///////////////////
function legacyQualificationFrom(emp: Partial<Employee>): Qualification | null {
  const has =
    emp.education || emp.collage || emp.sourceAcadimicQualification ||
    emp.dateQualification || emp.detailsQualification || emp.paperFileNumber;

  if (!has) return null;

  return {
    paperFileNumber: emp.paperFileNumber || undefined,
    collage: emp.collage || undefined,
    education: (emp.education as any) || '', // قد تكون undefined مسبقًا
    sourceAcadimicQualification: emp.sourceAcadimicQualification || undefined,
    // نحفظ كـ ISO نصي في التخزين؛ الـ mapper يحوّله Date للـ Form
    dateQualification: emp.dateQualification ? new Date(emp.dateQualification).toISOString().slice(0,10) : null,
    detailsQualification: emp.detailsQualification || undefined,
  };
}

function ensureDetails(e: Partial<Employee>): EmployeeDetails {
  const q = (e.details?.qualifications ?? []).slice();
  if (!q.length) {
    const legacy = legacyQualificationFrom(e);
    if (legacy) q.push(legacy);
  }
  return { qualifications: q };
}






export type NewEmployee = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;
export type EmployeeUpdate = Partial<Omit<Employee, 'id' | 'createdAt'>> & { id: string };
export const OTHER_VALUE = '__OTHER__';


const STORAGE_KEY = 'employees';

const DATE_KEYS = new Set<string>([
  'birthDate',
  'workDate',
  'dateActionWork',
  // 'dateQualification',
  'dateStatusWork',
  'datecurrentDecisionAppointment',
  'createdAt',
  'updatedAt',
]);
  // لتحديد أي الحقول يجب تحويلها إلى تواريخ عند القراءة من التخزين المحلي
function reviveDates(key: string, value: any) {
  if (value && typeof value === 'string' && DATE_KEYS.has(key)) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return value;
}

function normalizeNationalities(emp: Partial<Employee>): {
  nationality: string[];
  otherNationality: string | null;
} 
{
  // 1) اقرأ الـ nationality بأي شكل محتمل
  const raw = (emp.nationality as any) ?? [];
  let list: string[] = Array.isArray(raw)
    ? raw.slice()
    : (typeof raw === 'string' ? raw.split(/[,\u060C]/) : []);

  // 2) نظّف القيم: قص المسافات، احذف القيم الوهمية
  list = list
    .map(v => (typeof v === 'string' ? v.trim() : ''))
    .filter(v => v && v !== OTHER_VALUE && v !== 'غير ذلك');

  // 3) أضف otherNationality (إن وُجدت) بدل "__OTHER__"
  const other = (emp.otherNationality ?? '').trim();
  if (other) {
    const lower = other.toLowerCase();
    if (!list.some(x => x.toLowerCase() === lower)) {
      list.push(other);
    }
  }

  // 4) امنع التكرار (case-insensitive)
  const seen = new Set<string>();
  list = list.filter(v => {
    const k = v.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return { nationality: list, otherNationality: other || null };
}



@Injectable({ providedIn: 'root' })
export class LocalEmployeesService {
  private readonly CUSTOM_NATS_KEY = 'customNationalities_v1';

  getCustomNationalities(): string[] {
    try {
      const raw = localStorage.getItem(this.CUSTOM_NATS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter((x: any) => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }

  addCustomNationality(label: string): void {
  const clean = (label || '').trim();
  if (!clean) return;

  const current = this.getCustomNationalities();
  const exists = current.some(x => x.toLowerCase() === clean.toLowerCase());
  if (!exists) {
    const next = [...current, clean].sort((a,b) => a.localeCompare(b, 'ar'));
    localStorage.setItem(this.CUSTOM_NATS_KEY, JSON.stringify(next));
  }
}

remove(id: string): void {
  const list = this.readAll().filter(e => e.id !== id);
  this.writeAll(list);
}

//  لضمان قرائتهم عند اضافة ايا قائمة جديدة في ال اللوكل ايمبلويي

  private readAll(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? (JSON.parse(raw, reviveDates) as Employee[]) : [];
    //  ضمن وجود details.qualifications حتى للبيانات القديمة
    return arr.map(e => ({
       ...e,
        details: ensureDetails(e) ,
        attachments: ensureDocAttachments(e),
      }));
  } catch {
    return [];
  }
}
  

  private writeAll(list: Employee[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  

  add(emp: NewEmployee): Employee {
  const list = this.readAll();

  const norm = normalizeNationalities(emp);

  const newEmp: Employee = {
    ...emp,
    nationality: norm.nationality,
    otherNationality: norm.otherNationality,
     details: ensureDetails(emp), // ← مهم
  attachments: ensureDocAttachments(emp),   // ← إضافة آمنة


    id: crypto.randomUUID?.() ?? `emp_${Date.now()}`,
    createdAt: new Date(),
  };

  list.push(newEmp);
  this.writeAll(list);
  return newEmp;
}


  list(): Employee[] {
    return this.readAll();
  } 

  clearAll(): void {
    this.writeAll([]);
  }

//  update(patch: EmployeeUpdate): Employee | null {
//   const list = this.readAll();
//   const i = list.findIndex(e => e.id === patch.id);
//   if (i === -1) return null;

//   const prev = list[i];

//   // دمج عميق بسيط لـ details
//   const merged: Employee = {
//     ...prev,
//     ...patch,
//     details: ensureDetails({
//       ...prev,
//       ...(patch as any),
//       details: {
//         qualifications: [
//           ...((prev.details?.qualifications) ?? []),
//           ...(((patch as any).details?.qualifications) ?? []),
//         ]
//       }
//     }),
//   };

//   const norm = normalizeNationalities(merged);

//   const updated: Employee = {
//     ...merged,
//     nationality: norm.nationality,
//     otherNationality: norm.otherNationality,
//     updatedAt: new Date(),
//   };

//   list[i] = updated;
//   this.writeAll(list);
//   return updated;
// }

update(patch: EmployeeUpdate): Employee | null {
  const list = this.readAll();
  const i = list.findIndex(e => e.id === patch.id);
  if (i === -1) return null;

  const prev = list[i];

  const merged: Employee = {
    ...prev,
    ...patch,
    //  استبدل قائمة الشهادات بالكامل إن أرسلها الـpatch، وإلا أبقِ القديمة
    details: {
      qualifications:
        (patch as any).details?.qualifications ??
        prev.details?.qualifications ?? []
    }
  };

  const norm = normalizeNationalities(merged);

  const updated: Employee = {
    ...merged,
    nationality: norm.nationality,
    otherNationality: norm.otherNationality,
    updatedAt: new Date(),
  };

  list[i] = updated;
  this.writeAll(list);
  return updated;
}




}
