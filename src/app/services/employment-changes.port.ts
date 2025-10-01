import { InjectionToken } from '@angular/core';
import { EmploymentChange } from '../models/employment-change';

// export interface EmploymentChangesPort {
//   list(employeeId: string): Promise<EmploymentChange[]>;
//   create(change: Partial<EmploymentChange>): Promise<EmploymentChange>;
//   delete(employeeId: string, changeId: string): Promise<void>;
// }


// employment-changes.port.ts
export interface EmploymentChangesPort {
  list(employeeId: string): Promise<EmploymentChange[]>;
  create(change: EmploymentChange): Promise<void>;
  delete(employeeId: string, changeId: string): Promise<void>;
}


export const EMPLOYMENT_CHANGES_PORT = new InjectionToken<EmploymentChangesPort>('EMPLOYMENT_CHANGES_PORT');
 //تعريف التوكن مع الانترفيس 
//لتسهيل تبديل التنفيذ لاحقاً (وقت يجهز الباكند)