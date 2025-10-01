// import { Injectable } from '@angular/core';
// import { EmploymentChange } from '../models/employment-change';
// import { EmploymentChangesPort } from './employment-changes.port';

// // بدّلها لاحقاً بـ uuid من باكند
// const uid = () => Math.random().toString(36).slice(2);

// const KEY = 'emp_changes_v1';

// @Injectable({ providedIn: 'root' })
// export class LocalEmploymentChangesService implements EmploymentChangesPort {
//   private cache: Record<string, EmploymentChange[]> = {};

//   constructor() { this.load(); }

//   private load() {
//     try { this.cache = JSON.parse(localStorage.getItem(KEY) || '{}'); }
//     catch { this.cache = {}; }
//     // تحويل التواريخ من نص إلى Date
//     for (const k of Object.keys(this.cache)) {
//       this.cache[k] = (this.cache[k] || []).map(c => ({
//         ...c,
//         effectiveFrom: new Date(c.effectiveFrom),
//         decisionDate: c.decisionDate ? new Date(c.decisionDate) : undefined,
//         createdAt: new Date(c.createdAt),
//       }));
//     }
//   }
//   private save() { localStorage.setItem(KEY, JSON.stringify(this.cache)); }

//   async list(employeeId: string): Promise<EmploymentChange[]> {
//     const id = String(employeeId);
//     const all = this.cache?.['all'] ?? [];
//     const result = all.filter(c => String(c.employeeId) === id);  // مقارنة نصوص
//     console.log('[Service] list for', id, '->', result.length);
//     return [...result];
//   }


//   async create(change: EmploymentChange): Promise<void> {
//     const eId = change.employeeId!;
//     const c: EmploymentChange = {
//       id: uid(),
//       employeeId: eId,
//       type: (change.type || 'OTHER') as any,
//       effectiveFrom: change.effectiveFrom ? new Date(change.effectiveFrom) : new Date(),
//       decisionNumber: change.decisionNumber,
//       decisionDate: change.decisionDate ? new Date(change.decisionDate) : undefined,
//       reason: change.reason,
//       newJobTitle: change.newJobTitle,
//       newJobCategory: change.newJobCategory,
//       newJobAttribute: change.newJobAttribute,
//       newAppointmentType: change.newAppointmentType,
//       newSalary: change.newSalary,
//       newPlaceCode: change.newPlaceCode,
//       createdAt: new Date(),
//       createdBy: 'local-dev', // بدّلها لاحقاً
//     };
//     this.cache[eId] = [...(this.cache[eId] || []), c];
//     this.save();
//     return c;
//   }

//   async delete(employeeId: string, changeId: string): Promise<void> {
//     this.cache[employeeId] = (this.cache[employeeId] || []).filter(c => c.id !== changeId);
//     this.save();
//   }
// }

import { Injectable } from '@angular/core';
import { EmploymentChange } from '../models/employment-change';
import { EmploymentChangesPort } from './employment-changes.port';

// لاحقًا استبدله بـ uuid من الباكند
const uid = () => Math.random().toString(36).slice(2);

// غيّر النسخة إذا بدّك تكسر الكاش القديم
const KEY = 'emp_changes_v2';

type CacheShape = Record<string, EmploymentChange[]>; // مفتاح = employeeId

@Injectable({ providedIn: 'root' })
export class LocalEmploymentChangesService implements EmploymentChangesPort {
  private cache: CacheShape = {};

  constructor() {
    this.load();
  }

  /** تحميل الكاش من localStorage + تحويل النصوص إلى Date */
  private load() {
    try {
      const raw = localStorage.getItem(KEY);
      this.cache = raw ? JSON.parse(raw) as CacheShape : {};
    } catch {
      this.cache = {};
    }

    for (const empId of Object.keys(this.cache)) {
      this.cache[empId] = (this.cache[empId] || []).map(c => ({
        ...c,
        effectiveFrom: new Date(c.effectiveFrom as any),
        decisionDate: c.decisionDate ? new Date(c.decisionDate as any) : undefined,
        createdAt: new Date(c.createdAt as any),
      }));
    }
  }

  /** حفظ الكاش إلى localStorage (تواريخ ستُحفظ كسلاسل ISO تلقائيًا) */
  private save() {
    localStorage.setItem(KEY, JSON.stringify(this.cache));
  }

  /** إرجاع تغييرات موظف واحد (مرتّبة بالأحدث أولًا) */
  async list(employeeId: string): Promise<EmploymentChange[]> {
    const id = String(employeeId);
    const list = this.cache[id] || [];
    const sorted = [...list].sort(
      (a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime()
    );
    console.log('[Service] list for', id, '->', sorted.length);
    return sorted;
  }

  /** إنشاء تغيير جديد لموظف */
  async create(change: EmploymentChange): Promise<void> {
    const eId = String(change.employeeId || '').trim();
    if (!eId) {
      throw new Error('employeeId is required');
    }

    const c: EmploymentChange = {
      id: uid(),
      employeeId: eId,
      type: change.type || 'OTHER',
      effectiveFrom: change.effectiveFrom ? new Date(change.effectiveFrom) : new Date(),
      decisionNumber: change.decisionNumber,
      // decisionDate: change.decisionDate ? new Date(change.decisionDate) : undefined,
      reason: change.reason,
      newJobTitle: change.newJobTitle,
      newJobCategory: change.newJobCategory,
      newJobAttribute: change.newJobAttribute,
      newAppointmentType: change.newAppointmentType,
      newSalary: change.newSalary,
      newPlaceCode: change.newPlaceCode,
      newdecisionappointment: change.newdecisionappointment,
      newdecisiondate: change.newdecisiondate ? new Date(change.newdecisiondate) : undefined,
      createdAt: new Date(),
      createdBy: change.createdBy || 'local-dev',

    };

    const bucket = this.cache[eId] || [];
    this.cache[eId] = [...bucket, c];
    this.save();
    console.log('[Service] created change for', eId, c.id);
  }

  /** حذف تغيير محدد لموظف */
  async delete(employeeId: string, changeId: string): Promise<void> {
    const id = String(employeeId);
    const list = this.cache[id] || [];
    const next = list.filter(c => c.id !== changeId);
    this.cache[id] = next;
    this.save();
    console.log('[Service] deleted change', changeId, 'for', id);
  }
}
