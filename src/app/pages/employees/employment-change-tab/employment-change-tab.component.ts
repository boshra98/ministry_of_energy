// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-employment-change-tab',
//   imports: [],
//   templateUrl: './employment-change-tab.component.html',
//   styleUrl: './employment-change-tab.component.scss'
// })
// export class EmploymentChangeTabComponent {

// }



import { Component, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges, inject, ChangeDetectorRef , OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule }   from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { EMPLOYMENT_CHANGES_PORT, EmploymentChangesPort } from '../../../services/employment-changes.port';
import { EmploymentChange, EmploymentChangeType } from '../../../models/employment-change';
import { deriveCurrentState } from '../../../utils/derive-current';
import { LookupService } from '../../../services/lookup.service';
import { AddChangeDialogComponent } from '../add-change-dialog/add-change-dialog.component';
import { Employee } from '../../../services/local-employees.service';
import { OrgNamePipe, OrgNode } from '../../../pipes/org-name.pipe';
// import { DEPARTMENTS } from '../../../models/department';
import { OrgTreeService } from '../../../services/org-tree.service';

import { LookupOption } from '../../../models/lookup.models';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-employment-changes-tab',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule , OrgNamePipe],
  templateUrl: './employment-change-tab.component.html',
  styleUrls: ['./employment-change-tab.component.scss'],
})


export class EmploymentChangeTabComponent implements OnInit, OnChanges ,OnDestroy {
  @Input({ required: true }) employee!: Employee;
  @Output() snapshotChange = new EventEmitter<Employee>();

  private port   = inject(EMPLOYMENT_CHANGES_PORT) as EmploymentChangesPort;
  private dialog = inject(MatDialog);
  private lookup = inject(LookupService);
  private cdr    = inject(ChangeDetectorRef);
private destroy$ = new Subject<void>();
private org = inject(OrgTreeService);

  changes: EmploymentChange[] = [];
  // orgTree: OrgNode[] = DEPARTMENTS; // لتغذية البايب
  orgTree: OrgNode[] = [];

  jobCategoryOpts: LookupOption[] = [];
  jobAttributeOpts: LookupOption[] = [];
  appointmentTypesOpts: LookupOption[] = [];
  jobTitleOpts: LookupOption[] = []; // د

  @Input() readonly = false;   // ✅ جديد

  displayedColumns: string[] = ['type', 'effectiveFrom', 'diff', 'decision', 'actions'];

  ngOnInit() {
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

    
this.org.tree$
  .pipe(takeUntil(this.destroy$))
  .subscribe(tree => {
    this.orgTree = tree ?? [];
    this.cdr.markForCheck();
  });

  if (this.employee?.id) this.load();
  this.updateDisplayedColumns();
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employee'] && this.employee?.id != null) {
      this.load();
    }

    if (changes['readonly'] && this.employee?.id != null) {
      this.updateDisplayedColumns();
    }

    
  }


  private updateDisplayedColumns() {
  this.displayedColumns = this.readonly
    ? ['type','effectiveFrom','diff','decision']
    : ['type','effectiveFrom','diff','decision','actions'];
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


  
 

  openAdd() {
      if (this.readonly) return;           // ✅ منع

  if (!this.employee?.id) return;

  const ref = this.dialog.open(AddChangeDialogComponent, {
    width: '720px',
    data: { emp: this.employee },
    autoFocus: false,
  });

 ref.afterClosed().subscribe(res => {
  if (res?.ok) {
    // حدّث الجدول من الخادم
    this.load();

    // حدّث بطاقة الموظف في الأب لو عاد Snapshot
    if (res.snapshot) {
      this.snapshotChange.emit(this.deepClone(res.snapshot));
    }
  }
});

}


  async remove(change: EmploymentChange) {
      if (this.readonly) return;           // ✅ منع

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