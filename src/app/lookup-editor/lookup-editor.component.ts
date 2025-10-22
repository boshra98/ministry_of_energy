


import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { LookupKey, LookupOption } from '../models/lookup.models';
import { LookupRegistryService } from '../services/lookup-registry.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatInputModule } from "@angular/material/input";
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-lookup-editor',
  templateUrl: './lookup-editor.component.html',
  styleUrls: ['./lookup-editor.component.scss'],
  standalone: true,

  imports: [MatInputModule , 
     CommonModule,
    FormsModule,            // << لازم لـ ngModel
    ReactiveFormsModule,
    DragDropModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  MatChipsModule,
    ],
 
})
export class LookupEditorComponent implements OnInit, OnChanges {

  // من اجل الملف الذي يتم تحميله في الاستيراد 
  onFileInput(input: HTMLInputElement) {
  const file = input.files?.item(0);
  if (!file) return;
  this.importFromFile(file);
}

async importFromFile(file: File) {
  const txt = await file.text();
  this.svc.import(this.key, txt);
}

  @Input({ required: true }) key!: LookupKey;

  q = '';
  private q$ = new BehaviorSubject<string>('');

  items$!: Observable<LookupOption[]>;
  form!: FormGroup;

  constructor(private svc: LookupRegistryService, private fb: FormBuilder) {}

  ngOnInit() {
    // إنشاء الـ form بعد تهيئة fb
    this.form = this.fb.group({
      label: ['', [Validators.required, Validators.maxLength(100)]],
      value: ['', [Validators.required, Validators.maxLength(100)]],
    });

    // أول بناء للستريم
    this.buildItemsStream();
  }

  ngOnChanges(changes: SimpleChanges) {
    // لو تغيّر الـ key من الأب، أعد بناء الستريم
    if (changes['key'] && !changes['key'].firstChange) {
      this.buildItemsStream();
    }
  }

  private buildItemsStream() {
    this.items$ = combineLatest([
      this.svc.list$(this.key),
      this.q$,
    ]).pipe(
      map(([list, q]) =>
        list
          .filter(x => !q || x.label.includes(q) || x.value.includes(q))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      )
    );
  }

  onQueryChange(v: string) {
    this.q = v;
    this.q$.next(v);
  }

  add() {
    if (this.form.invalid) return;
    this.svc.add(this.key, this.form.value as any);
    this.form.reset();
  }

  drop(ev: CdkDragDrop<LookupOption[]>, current: LookupOption[]) {
    const arr = [...current];
    moveItemInArray(arr, ev.previousIndex, ev.currentIndex);
    this.svc.reorder(this.key, arr.map(x => x.id));
  }

  del(it: LookupOption) {
    this.svc.remove(this.key, it.id);
  }

  saveInline(it: LookupOption) {
    this.svc.update(this.key, it.id, { label: it.label, value: it.value });
  }

  resetDefaults() {
    this.svc.resetToDefaults(this.key);
  }

  export() {
    const blob = new Blob([this.svc.export(this.key)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `${this.key}.json`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  }

  async import(file: File) {
    const txt = await file.text();
    this.svc.import(this.key, txt);
  }
}


