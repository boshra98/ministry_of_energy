


import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalEmployeesService } from './local-employees.service';

@Injectable({ providedIn: 'root' })
export class NationalityService {
  private _nationalities = new BehaviorSubject<string[]>([]);
  nationalities$ = this._nationalities.asObservable();

  constructor(private local: LocalEmployeesService) {
    const base = [
      'سوري','فلسطيني سوري','لبناني','اردني','فلسطيني أردني','مصري',
      'فلسطيني لبناني','حاصل على الجنسية التركية','حاصل على الجنسية الخليجية',
      'حاصل على الجنسية الأوروبية','حاصل على الجنسية الاميركية'
    ];
    const custom = this.local.getCustomNationalities();
    this._nationalities.next([...base, ...custom]);
  }

  /** إضافة جنسية جديدة */
  addNationality(newNat: string) {
    const t = newNat.trim();
    if (!t) return;

    const current = this._nationalities.getValue();
    if (!current.some(x => x.toLowerCase() === t.toLowerCase())) {
      const next = [...current, t];
      this._nationalities.next(next);
      this.local.addCustomNationality(t); // ← خزّن في LocalStorage كمان
    }
  }

  /** الحصول على القائمة الحالية */
  getNationalities(): string[] {
    return this._nationalities.getValue();
  }
}
