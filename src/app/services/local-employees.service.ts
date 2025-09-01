import { Injectable } from '@angular/core';

export interface Employee {
  detailsQualification: string | null | undefined;
  dateQualification: Date | null | undefined;
  sourceAcadimicQualification: string | null | undefined;
  materialStatus: string | null | undefined;
  nationality: string | null | undefined;
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
updatedAt?: string; // ✅ أضِف هذا

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
