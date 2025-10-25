// // src/app/services/lookup.service.ts
// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import { LookupOption } from '../shared/lookups/lookups.types';
// import {
//   GENDERS, BLOOD_TYPES, MARITAL_STATUS, EMERGENCY_RELATIONS,
//   JOB_TITLES_DEFAULT, EDUCATIONS_DEFAULT ,JOBATTRIBUTE_DEFAULT,JOBCATEGORY_DEFAULT , decisionAttribute_DEFAULT,
//   appointmentTypes_DEFAULT
// } from '../shared/lookups/lookups.constants';

// @Injectable({ providedIn: 'root' })
// export class LookupService {
  
//   readonly genders$            = new BehaviorSubject<LookupOption[]>(GENDERS).asObservable();
//   readonly bloodTypes$         = new BehaviorSubject<LookupOption[]>(BLOOD_TYPES).asObservable();
//   readonly maritalStatus$      = new BehaviorSubject<LookupOption[]>(MARITAL_STATUS).asObservable();
//   readonly emergencyRelations$ = new BehaviorSubject<LookupOption[]>(EMERGENCY_RELATIONS).asObservable();
//    readonly JOBATTRIBUTE_DEFAULTES$ = new BehaviorSubject<LookupOption[]>(JOBATTRIBUTE_DEFAULT).asObservable();
//    readonly JOBCATEGORY_DEFAULTES$ = new BehaviorSubject<LookupOption[]>(JOBCATEGORY_DEFAULT).asObservable();
//    readonly appointmentTypes_DEFAULTES$ = new BehaviorSubject<LookupOption[]>(appointmentTypes_DEFAULT).asObservable();
// // decisionAttribute_DEFAULT
// readonly decisionAttribute_DEFAULTES$ = new BehaviorSubject<LookupOption[]>(decisionAttribute_DEFAULT).asObservable();
//   // قابلة للتحديث
//   private _jobTitles  = new BehaviorSubject<LookupOption[]>(JOB_TITLES_DEFAULT);
//   jobTitles$ = this._jobTitles.asObservable();

//   private _educations = new BehaviorSubject<LookupOption[]>(EDUCATIONS_DEFAULT);
//   educations$ = this._educations.asObservable();

//   // أمثلة تحديث
//   setJobTitles(list: LookupOption[])  { this._jobTitles.next(list); }
//   addJobTitle(opt: LookupOption)      { this._jobTitles.next([...this._jobTitles.value, opt]); }

//   setEducations(list: LookupOption[]) { this._educations.next(list); }
//   addEducation(opt: LookupOption)     { this._educations.next([...this._educations.value, opt]); }
// }

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LookupKey, LookupOption } from '../models/lookup.models';
import { LookupRegistryService } from '../services/lookup-registry.service';

@Injectable({ providedIn: 'root' })
export class LookupService {
  constructor(private registry: LookupRegistryService) {}

  list$(key: LookupKey): Observable<LookupOption[]> {
    return this.registry.list$(key);
  }

  // قنوات جاهزة كـ getters (لن تُنفَّذ قبل تهيئة registry)
  get genders$()            { return this.registry.list$('GENDERS'); }
  get bloodTypes$()         { return this.registry.list$('BLOOD_TYPES'); }
  get maritalStatus$()      { return this.registry.list$('MARITAL_STATUS'); }
  get emergencyRelations$() { return this.registry.list$('EMERGENCY_RELATIONS'); }

  get jobTitles$()          { return this.registry.list$('JOB_TITLES'); }
  get educations$()         { return this.registry.list$('EDUCATIONS'); }

  get jobAttributes$()      { return this.registry.list$('JOB_ATTRIBUTE'); }
  get jobCategories$()      { return this.registry.list$('JOB_CATEGORY'); }
  get decisionAttributes$() { return this.registry.list$('DECISION_ATTRIBUTE'); }
  get appointmentTypes$()   { return this.registry.list$('APPOINTMENT_TYPES'); }

  get nationalities$()      { return this.registry.list$('NATIONALITIES'); }

  // عمليات CRUD (طابق توقيع registry.add)
 add(key: LookupKey, opt: Omit<LookupOption, 'id' | 'order'>): Promise<LookupOption | null> {
  return this.registry.add(key, opt);
}

  update(key: LookupKey, id: string, patch: Partial<LookupOption>) {
    return this.registry.update(key, id, patch);
  }
  remove(key: LookupKey, id: string) {
    return this.registry.remove(key, id);
  }
  reorder(key: LookupKey, orderedIds: string[]) {
    return this.registry.reorder(key, orderedIds);
  }
  resetToDefaults(key: LookupKey) {
    return this.registry.resetToDefaults(key);
  }
  export(key: LookupKey) {
    return this.registry.export(key);
  }
  import(key: LookupKey, json: string) {
    return this.registry.import(key, json);
  }
}
