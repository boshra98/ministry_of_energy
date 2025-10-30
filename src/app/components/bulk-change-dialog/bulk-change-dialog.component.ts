// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-bulk-change-dialog',
//   imports: [],
//   templateUrl: './bulk-change-dialog.component.html',
//   styleUrl: './bulk-change-dialog.component.scss'
// })
// export class BulkChangeDialogComponent {

// }


import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOption } from '@angular/material/core';

import { EMPLOYMENT_CHANGES_PORT, EmploymentChangesPort } from '../../../app/services/employment-changes.port';
import { EmploymentChangeType } from '../../../app/models/employment-change';
import { LookupService } from '../../services/lookup.service';
import { OrgTreeService } from '../../services/org-tree.service';
import { LookupOption } from '../../models/lookup.models';
import { OrgNode } from '../place-tree-dialog/place-tree-dialog.component';
import { Subject, takeUntil } from 'rxjs';
import { MatSelect } from "@angular/material/select";
import { MatIcon } from "@angular/material/icon";
import { MatDivider } from "@angular/material/divider";

@Component({
  selector: 'app-bulk-change-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatButtonModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule,
    MatOption,
    MatSelect,
    MatIcon,
    MatDivider
],
  templateUrl: './bulk-change-dialog.component.html',
  styleUrls: ['./bulk-change-dialog.component.scss']
})
// export class BulkChangeDialogComponent {
// onPickLevel(_t160: number,arg1: any) {
// throw new Error('Method not implemented.');
// }
//   readonly data = inject(MAT_DIALOG_DATA) as { employeeIds: string[]; type: EmploymentChangeType };
//   readonly ref  = inject(MatDialogRef<BulkChangeDialogComponent>);
//   readonly fb   = inject(FormBuilder);
//   readonly port = inject(EMPLOYMENT_CHANGES_PORT) as EmploymentChangesPort;
//   lookup = inject(LookupService);
//   org = inject(OrgTreeService);
//   saving = false;


  
//   //lookup
//     jobCategoryOpts: LookupOption[] = [];
//     jobAttributeOpts: LookupOption[] = [];
//     appointmentTypesOpts: LookupOption[] = [];
//     jobTitleOpts: LookupOption[] | undefined;
  
//     //org tree
  
//     // orgTree: OrgNode[] = DEPARTMENTS;
//   orgTree: OrgNode[] = [];
//   path: string[] = [];                  // المسار المختار (كود لكل مستوى)
//   levels: OrgNode[][] = []; 
//   trackByValue = (_: number, it: { value: string }) => it.value;
//   get t() { return (this.form.get('type')!.value || 'OTHER') as EmploymentChangeType; }


//   form = this.fb.group({
//     effectiveFrom: [null, Validators.required],
//     decisionNumber: [''],
//     decisionDate: [null],
//     reason: [''],
//     newSalary: [null], 
//     newJobTitle: [null],
//     newJobCategory: [null],
//     newJobAttributes: [null],
//     newAppointmentType: [null],
//     newPlaceCode: [null],
//     newdecisionappointment: [''],
//     newdecisiondate: [null as Date | null],
//     // مثال لحالة SALARY_INCREASE
//   });

//   constructor() {
//     // تحميل اللوائح
//     this.lookup.jobCategories$.subscribe(o => this.jobCategoryOpts = o || []);
//     this.lookup.jobAttributes$.subscribe(o => this.jobAttributeOpts = o || []);
//     this.lookup.appointmentTypes$.subscribe(o => this.appointmentTypesOpts = o || []);
//     this.lookup.jobTitles$.subscribe(o => this.jobTitleOpts = o || []);
//     // this.flattenOrgs(this.orgTree, this.flatPlaces);
//   }

//     private destroy$ = new Subject<void>();
//   rebuildLevels() {
//     this.levels = [];
//     let cursor = this.orgTree;
//     this.levels.push(cursor);           // المستوى 0 = الجذر
//     for (let i = 0; i < this.path.length; i++) {
//       const code = this.path[i];
//       const node = cursor.find(n => n.code === code);
//       const kids = node?.subs ?? [];
//       if (!kids.length) break;
//       this.levels.push(kids);           // المستوى التالي
//       cursor = kids;
//     }
//   }
  
  
//   // إن أردت إرسال مصفوفة الأكواد كلها لحقل النموذج:
//   get placeActionWorkPath(): string[] {
//     return this.path;
//   }

//   async save() {
//     if (this.form.invalid) return;
//     this.saving = true;

//     const v = this.form.getRawValue();

//     const successIds: string[] = [];
//     const failed: Array<{id: string; error: string}> = [];

//     for (const id of this.data.employeeIds) {
//       try {
//         await this.port.create({
//           employeeId: id,
//           type: this.data.type,
//           effectiveFrom: v.effectiveFrom ?? undefined,
//           decisionNumber: (v.decisionNumber || undefined),
//           decisionDate: v.decisionDate ?? undefined,
//           reason: (v.reason || undefined),
//           newSalary: v.newSalary ?? undefined,


//     newJobTitle: (v.newJobTitle || '').trim() || undefined,
//     newJobCategory: (v.newJobCategory || '').trim() || undefined,
//     newJobAttribute: (v.newJobAttributes || '').trim() || undefined,
//     newAppointmentType: (v.newAppointmentType || '').trim() || undefined,

//     newdecisionappointment: (v.newdecisionappointment || '').trim() || undefined,
//     newdecisiondate: v.newdecisiondate ?? undefined,
  
//         } as any);
//         successIds.push(id);
//       } catch (e: any) {
//         failed.push({ id, error: e?.message ?? 'فشل غير معروف' });
//       }
//     }

//     this.saving = false;
//     this.ref.close({ ok: true, successIds, failed });
//   }

//   cancel() { this.ref.close(false); }
// }

export class BulkChangeDialogComponent implements OnInit, OnDestroy {
  // ===== Injects =====
  readonly data = inject(MAT_DIALOG_DATA) as { employeeIds: string[]; type: EmploymentChangeType };
  readonly ref  = inject(MatDialogRef<BulkChangeDialogComponent>);
  readonly fb   = inject(FormBuilder);
  readonly port = inject(EMPLOYMENT_CHANGES_PORT) as EmploymentChangesPort;
  readonly lookup = inject(LookupService);
  readonly org = inject(OrgTreeService);

  // ===== State =====
  saving = false;
  private destroy$ = new Subject<void>();

  // lookups
  jobCategoryOpts: LookupOption[] = [];
  jobAttributeOpts: LookupOption[] = [];
  appointmentTypesOpts: LookupOption[] = [];
  jobTitleOpts: LookupOption[] = [];

  // org tree path picker
  orgTree: OrgNode[] = [];
  path: string[] = [];            // الأكواد المختارة لكل مستوى
  levels: OrgNode[][] = [];       // خيارات كل مستوى لبنائها تتابعيًا

  // النوع يأتي من data
  get t(): EmploymentChangeType { return this.data.type; }
  trackByValue = (_: number, it: { value: string }) => it.value;

  // ===== Form =====
  form = this.fb.group({
    effectiveFrom: [null, Validators.required],
    decisionNumber: [''],
    decisionDate: [null as Date | null],
    reason: [''],

    // لزيادة الراتب
    newSalary: [null as number | null],

    // للترقية
    newJobTitle: [''],
    newJobCategory: [''],
    newJobAttribute: [''],
    newAppointmentType: [''],

    // للنقل الداخلي
    newPlaceCode: [''],

    // تحديث الحقل الحالي في بطاقة الموظف (اختياري)
    newdecisionappointment: [''],
    newdecisiondate: [null as Date | null],
  });

  // ===== Lifecycle =====
  ngOnInit(): void {
    // Lookups
    this.lookup.jobCategories$
      .pipe(takeUntil(this.destroy$))
      .subscribe(o => this.jobCategoryOpts = o ?? []);

    this.lookup.jobAttributes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(o => this.jobAttributeOpts = o ?? []);

    this.lookup.appointmentTypes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(o => this.appointmentTypesOpts = o ?? []);

    this.lookup.jobTitles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(o => this.jobTitleOpts = o ?? []);

    // Org tree
    this.org.tree$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tree => {
        this.orgTree = tree ?? [];
        this.path = [];       // لا يوجد مسار مسبق في الحالة الجماعية
        this.rebuildLevels();
        this.updateDeepestPlaceCode();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Org path helpers =====
  rebuildLevels(): void {
    this.levels = [];
    let cursor = this.orgTree;
    this.levels.push(cursor);
    for (let i = 0; i < this.path.length; i++) {
      const code = this.path[i];
      const node = cursor.find(n => n.code === code);
      const kids = node?.subs ?? [];
      if (!kids.length) break;
      this.levels.push(kids);
      cursor = kids;
    }
  }

  onPickLevel(i: number, code: string): void {
    this.path = [...this.path.slice(0, i), code];
    this.rebuildLevels();
    this.updateDeepestPlaceCode();
  }

  private updateDeepestPlaceCode(): void {
    const deepest = this.path.length ? this.path[this.path.length - 1] : '';
    this.form.patchValue({ newPlaceCode: deepest }, { emitEvent: false });
  }

  get placeActionWorkPath(): string[] { return this.path; }

  // ===== Actions =====
  async save(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const v = this.form.getRawValue();

    // payload المشترك
    const base: any = {
      type: this.t,
      effectiveFrom: v.effectiveFrom ?? undefined,
      decisionNumber: (v.decisionNumber || undefined),
      decisionDate: v.decisionDate ?? undefined,
      reason: (v.reason || undefined),

      // تحديث الحقل الحالي (اختياري)
      newdecisionappointment: (v.newdecisionappointment || undefined),
      newdecisiondate: v.newdecisiondate ?? undefined,
    };

    if (this.t === 'SALARY_INCREASE') {
      base.newSalary = v.newSalary ?? undefined;
    }

    if (this.t === 'PROMOTION') {
      base.newJobTitle = (v.newJobTitle || undefined);
      base.newJobCategory = (v.newJobCategory || undefined);
      base.newJobAttribute = (v.newJobAttribute || undefined);
      base.newAppointmentType = (v.newAppointmentType || undefined);
    }

    if (this.t === 'INTERNAL_MOVE') {
      base.placeActionWork = this.placeActionWorkPath.length ? [...this.placeActionWorkPath] : undefined;
      base.newPlaceCode = (v.newPlaceCode || undefined);
    }

    const successIds: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    // مؤقتًا: إنشاء فردي متتابع. لاحقًا استبدله بـ port.bulkCreate
    for (const id of this.data.employeeIds) {
      try {
        await this.port.create({
          ...base,
          employeeId: id,
        });
        successIds.push(id);
      } catch (e: any) {
        failed.push({ id, error: e?.message ?? 'فشل غير معروف' });
      }
    }

    this.saving = false;
    this.ref.close({ ok: true, successIds, failed });
  }

  cancel(): void { this.ref.close(false); }
}