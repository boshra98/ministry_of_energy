// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-employment-change-tab',
//   imports: [],
//   templateUrl: './employment-change-tab.component.html',
//   styleUrl: './employment-change-tab.component.scss'
// })
// export class EmploymentChangeTabComponent {

// }



import { Component, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule }   from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { EMPLOYMENT_CHANGES_PORT, EmploymentChangesPort } from '../../../services/employment-changes.port';
import { EmploymentChange, EmploymentChangeType } from '../../../models/employment-change';
import { deriveCurrentState } from '../../../utils/derive-current';
import { LookupService } from '../../../services/lookup.service';
import { LookupOption } from '../../../shared/lookups/lookups.types';
import { AddChangeDialogComponent } from '../add-change-dialog/add-change-dialog.component';
import { Employee } from '../../../services/local-employees.service';
import { OrgNamePipe, OrgNode } from '../../../pipes/org-name.pipe';
import { DEPARTMENTS } from '../../../models/department';

@Component({
  selector: 'app-employment-changes-tab',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule , OrgNamePipe],
  templateUrl: './employment-change-tab.component.html',
  styleUrls: ['./employment-change-tab.component.scss'],
})


export class EmploymentChangeTabComponent implements OnInit, OnChanges {
  @Input({ required: true }) employee!: Employee;
  @Output() snapshotChange = new EventEmitter<Employee>();

  private port   = inject(EMPLOYMENT_CHANGES_PORT) as EmploymentChangesPort;
  private dialog = inject(MatDialog);
  private lookup = inject(LookupService);
  private cdr    = inject(ChangeDetectorRef);

  changes: EmploymentChange[] = [];
  orgTree: OrgNode[] = DEPARTMENTS; // لتغذية البايب

  jobCategoryOpts: LookupOption[] = [];
  jobAttributeOpts: LookupOption[] = [];
  appointmentTypesOpts: LookupOption[] = [];
  jobTitleOpts: LookupOption[] = []; // د

  displayedColumns: string[] = ['type', 'effectiveFrom', 'diff', 'decision', 'actions'];

  ngOnInit(): void {
    this.lookup.JOBCATEGORY_DEFAULTES$?.subscribe(o => this.jobCategoryOpts = o || []);
    this.lookup.JOBATTRIBUTE_DEFAULTES$?.subscribe(o => this.jobAttributeOpts = o || []);
    this.lookup.appointmentTypes_DEFAULTES$?.subscribe(o => this.appointmentTypesOpts = o || []);
    this.lookup.jobTitles$?.subscribe(o => this.jobTitleOpts = o || []); // ✅ جديد

    if (this.employee?.id != null) {
      this.load();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employee'] && this.employee?.id != null) {
      this.load();
    }
  }

  private deepClone<T>(obj: T): T {
    try { return structuredClone(obj); } catch { return JSON.parse(JSON.stringify(obj)); }
  }

  async load() {
    const empId = String(this.employee?.id || '').trim();
    if (!empId) {
      console.warn('[EmploymentChangeTab] missing employee id', this.employee?.id);
      return;
    }

    try {
      const list = await this.port.list(empId);

      this.changes = (Array.isArray(list) ? [...list] : [])
        .map(c => ({
          ...c,
          effectiveFrom: c.effectiveFrom ? new Date(c.effectiveFrom as any) : new Date(0),
          decisionDate:  c.decisionDate  ? new Date(c.decisionDate  as any) : new Date(0),
        }))
        .sort((a, b) => (a.effectiveFrom?.getTime() ?? 0) - (b.effectiveFrom?.getTime() ?? 0));

      const snapshot = deriveCurrentState(this.deepClone(this.employee), this.changes);
      this.snapshotChange.emit(snapshot);
    } catch (err) {
      console.error('[EmploymentChangeTab] load failed', err);
    } finally {
      this.cdr.markForCheck();
    }
  }

  constructor() { console.log('[EmploymentChangeTab] instance', this); }


  
  // openAdd() {
  //   if (!this.employee?.id) return;
  //   const ref = this.dialog.open(AddChangeDialogComponent, {
  //     width: '720px',
  //     data: { emp: this.employee }
  //   });
  //   ref.afterClosed().subscribe(ok => { if (ok) this.load(); });
  // }

  openAdd() {
  if (!this.employee?.id) return;

  const ref = this.dialog.open(AddChangeDialogComponent, {
    width: '720px',
    data: { emp: this.employee },
    autoFocus: false,
  });

  ref.afterClosed().subscribe(res => {
    if (res?.ok && res.snapshot) {
      // ✅ جالك Snapshot محدّث من الديالوغ مباشرة
      this.snapshotChange.emit(this.deepClone(res.snapshot));
    } else if (res === true) {
      // احتياطي لو أُغلِق الديالوغ بـ boolean فقط
      this.load();
    }
    // وإلا: لا شيء
  });
}


  async remove(change: EmploymentChange) {
    const empId = String(this.employee?.id || '').trim();
    if (!empId) return;
    await this.port.delete(empId, String(change.id));
    await this.load();
  }

  changeTypeLabel(t: EmploymentChangeType) {
    return ({
      PROMOTION:'ترقية وظيفية',
      SALARY_INCREASE:'زيادة راتب',
      INTERNAL_MOVE:'نقل/ندب',
      STATUS_UPDATE:'تغيير حالة',
      TERMINATION:'إنهاء خدمة',
      OTHER:'أخرى'
    } as const)[t] ?? t;
  }

  labelOf = (opts: LookupOption[], value?: string) =>
    opts.find(o => o.value === (value ?? ''))?.label ?? (value ?? '');
}