import { Injectable } from '@angular/core';

export interface Employee {
  dependences: string | null | undefined;
  emergencyPhone2: string | null | undefined;
  emergencyPhone1: string | null | undefined;
  emergencyContentRelation: string | null | undefined;
  emergencyName: string | null | undefined;
  datecurrentDecisionAppointment: string | null | undefined;
  currentDecisionAppointment: string | null | undefined;
  currentJoblocation: string | null | undefined;
  dateStatusWork: string | null | undefined;
  statusWork: string | null | undefined;
  currentSalary: string | null | undefined;
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
  bloodType: string | null | undefined;
  idNumber: string | null | undefined;
  nationalNumber: string | null | undefined;
  familyRegistration: string | null | undefined;
  centralSecretaion: string | null | undefined;
  placeBirth: string | null | undefined;
  detailsQualification: string | null | undefined;
  dateQualification: string | null | undefined;
  sourceAcadimicQualification: string | null | undefined;
  materialStatus: string | null | undefined;
  nationality: string[]| null | undefined;
  education: string | undefined;
  collage: string | undefined;
  workDate: Date | null | undefined;
  firstName: string;
  lastName: string;
  fatherName: string;
  motherName:string;
  paperFileNumber: string;
  gender: string;
  residence: string;
  jobTitle: string;
  birthDate: string; // YYYY-MM-DD (من input type="date")
  id: string;        // معرّف محلي
  createdAt: string; // ISO
updatedAt?: string; //  أضِف هذا

}
export type NewEmployee = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;
export type EmployeeUpdate = Partial<Omit<Employee, 'id' | 'createdAt'>> & { id: string };
const STORAGE_KEY = 'employees';

@Injectable({ providedIn: 'root' })
export class LocalEmployeesService {
  private readAll(): Employee[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as Employee[] : [];
    } catch {
      return [];
    }
  }

  private writeAll(list: Employee[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  add(emp: Omit<Employee, 'id' | 'createdAt'>): Employee {
    const list = this.readAll();
    const newEmp: Employee = {
      ...emp,
      id: crypto.randomUUID?.() ?? `emp_${Date.now()}`,
      createdAt: new Date().toISOString(),
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

 update(patch: EmployeeUpdate): Employee | null {
  const list = this.readAll();
  const i = list.findIndex(e => e.id === patch.id);
  if (i === -1) return null;

  const updated: Employee = {
    ...list[i],              // فيه createdAt والحقول الأخرى
    ...patch,                // يكتب القيم المعدلة فقط
    updatedAt: new Date().toISOString(),
  };

  list[i] = updated;
  this.writeAll(list);
  return updated;
}


}
