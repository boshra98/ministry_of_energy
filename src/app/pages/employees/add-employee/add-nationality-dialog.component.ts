import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NationalityService } from '../../../services/nationality.services';

export interface AddNationalityDialogData {
  existing: string[];  // لرفض التكرار (case-insensitive)
}

@Component({
  selector: 'app-add-nationality-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>إضافة جنسية جديدة</h2>

    <div mat-dialog-content>
      <mat-form-field appearance="outline" class="w-100" >
        <mat-label>اسم الجنسية</mat-label>
        <input matInput [formControl]="nameCtrl" (keydown.enter)="save()" />
        <mat-error *ngIf="nameCtrl.hasError('required')">الحقل مطلوب</mat-error>
        <mat-error *ngIf="nameCtrl.hasError('duplicate')">الجنسية موجودة مسبقًا</mat-error>
      </mat-form-field>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">إلغاء</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="nameCtrl.invalid">
        حفظ
      </button>
    </div>
  `,
  styles: [`.w-100 { width: 100%; }`]
  
})
export class AddNationalityDialogComponent {
  nameCtrl = new FormControl('', [Validators.required]);

  constructor(
    public dialogRef: MatDialogRef<AddNationalityDialogComponent>,
      private nationalityService: NationalityService,

    @Inject(MAT_DIALOG_DATA) public data: AddNationalityDialogData
  ) {}

  private isDuplicate(v: string): boolean {
    const t = (v || '').trim().toLowerCase();
    return this.data.existing.some(x => (x || '').trim().toLowerCase() === t);
  }

  save() {
    const v = (this.nameCtrl.value || '').trim();
    if (!v) return;

    if (this.isDuplicate(v)) {
      this.nameCtrl.setErrors({ duplicate: true });
      return;
    }
  this.nationalityService.addNationality(v);

    this.dialogRef.close(v);
    

  }
}
