// src/app/services/lookup.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LookupOption } from '../shared/lookups/lookups.types';
import {
  GENDERS, BLOOD_TYPES, MARITAL_STATUS, EMERGENCY_RELATIONS,
  JOB_TITLES_DEFAULT, EDUCATIONS_DEFAULT ,JOBATTRIBUTE_DEFAULT,JOBCATEGORY_DEFAULT , decisionAttribute_DEFAULT,
  appointmentTypes_DEFAULT
} from '../shared/lookups/lookups.constants';

@Injectable({ providedIn: 'root' })
export class LookupService {
  
  readonly genders$            = new BehaviorSubject<LookupOption[]>(GENDERS).asObservable();
  readonly bloodTypes$         = new BehaviorSubject<LookupOption[]>(BLOOD_TYPES).asObservable();
  readonly maritalStatus$      = new BehaviorSubject<LookupOption[]>(MARITAL_STATUS).asObservable();
  readonly emergencyRelations$ = new BehaviorSubject<LookupOption[]>(EMERGENCY_RELATIONS).asObservable();
   readonly JOBATTRIBUTE_DEFAULTES$ = new BehaviorSubject<LookupOption[]>(JOBATTRIBUTE_DEFAULT).asObservable();
   readonly JOBCATEGORY_DEFAULTES$ = new BehaviorSubject<LookupOption[]>(JOBCATEGORY_DEFAULT).asObservable();
   readonly appointmentTypes_DEFAULTES$ = new BehaviorSubject<LookupOption[]>(appointmentTypes_DEFAULT).asObservable();
// decisionAttribute_DEFAULT
readonly decisionAttribute_DEFAULTES$ = new BehaviorSubject<LookupOption[]>(decisionAttribute_DEFAULT).asObservable();
  // قابلة للتحديث
  private _jobTitles  = new BehaviorSubject<LookupOption[]>(JOB_TITLES_DEFAULT);
  jobTitles$ = this._jobTitles.asObservable();

  private _educations = new BehaviorSubject<LookupOption[]>(EDUCATIONS_DEFAULT);
  educations$ = this._educations.asObservable();

  // أمثلة تحديث
  setJobTitles(list: LookupOption[])  { this._jobTitles.next(list); }
  addJobTitle(opt: LookupOption)      { this._jobTitles.next([...this._jobTitles.value, opt]); }

  setEducations(list: LookupOption[]) { this._educations.next(list); }
  addEducation(opt: LookupOption)     { this._educations.next([...this._educations.value, opt]); }
}
