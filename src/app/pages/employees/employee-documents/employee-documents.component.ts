import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule }   from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
// أضف أي Material أخرى تستخدمها في القالب (Card, Dialog, etc.)
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { DocAttachment, DocAttachmentType } from '../../../services/local-employees.service';

// ✅ تأكد من اسم الملف الصحيح هنا (attachments-like.service وليس attachmentes)
import { AttachmentsServiceLike, LocalAttachmentsAdapterService } from '../../../services/attachmentes-like.service';



// إضافات على component.ts (فوق/داخل الكلاس)


// ثم ضفها في imports ضمن @Component كما نبّهتك سابقًا

// داخل الكلاس:



@Component({
  selector: 'app-employee-documents',
  standalone: true, // ✅ مهم لأنك تستخدم loadComponent
  templateUrl: './employee-documents.component.html',
  styleUrls: ['./employee-documents.component.scss'],
  imports: [
    CommonModule, DatePipe,MatTooltipModule,MatDividerModule,MatChipsModule,MatCardModule,
    MatInputModule, MatSelectModule, MatIconModule, MatButtonModule
  ],
  providers: [
    // ✅ ربط الواجهة بالتنفيذ المحلي
    { provide: AttachmentsServiceLike, useClass: LocalAttachmentsAdapterService }
  ]
})
export class EmployeeDocumentsComponent implements OnInit {
  @Input() employeeId!: string;
  @Input() mode: 'add' | 'edit' | 'view' = 'edit';

  attachments$ = new BehaviorSubject<DocAttachment[]>([]);
  selectedType: DocAttachmentType | null = null;

  types = [
    { name: 'profile_photo' as const, label: 'الصورة الشخصية' },
    { name: 'id_card_front' as const, label: 'هوية (أمام)' },
    { name: 'id_card_back'  as const, label: 'هوية (خلف)' },
    { name: 'family_record' as const, label: 'بيان عائلي/إخراج قيد' },
    { name: 'passport'      as const, label: 'جواز سفر' },
    { name: 'criminal_record' as const, label: 'لا حكم عليه' },
    { name: 'non_employment'  as const, label: 'غير موظف' },
    { name: 'appointment_order' as const, label: 'قرار التعيين' },
  ];

  constructor(
    private route: ActivatedRoute,
    private svc: AttachmentsServiceLike
  ) {}

  ngOnInit() {
    // إن استُخدم كمسار مستقل /employees/:id/documents
    this.employeeId = this.employeeId || this.route.snapshot.paramMap.get('id')!;
    this.refresh();
  }

  refresh() {
    const atts = this.svc.listAll(this.employeeId);
    this.attachments$.next(atts);
  }

  typeLabel(t: DocAttachmentType) {
    return this.types.find(x => x.name === t)?.label ?? t;
  }

  async onPick(ev: Event) {
    if (!this.selectedType) return;
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    // تحقّق النوع/الحجم
    if (!/^image\/(jpeg|png)$|^application\/pdf$/.test(file.type) || file.size > 5_000_000) {
      // TODO: أظهر رسالة للمستخدم
      return;
    }

    await this.svc.upsert(this.employeeId, file, this.selectedType);
    this.refresh();
  }

  async replace(a: DocAttachment) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.onchange = async () => {
      const file = (input.files?.[0]) || null;
      if (!file) return;
      await this.svc.replace(this.employeeId, a.id, file);
      this.refresh();
    };
    input.click();
  }

  remove(a: DocAttachment) {
    this.svc.remove(this.employeeId, a.id);
    this.refresh();
  }

  open(a: DocAttachment) {
    window.open(a.remoteUrl || a.dataUrl, '_blank');
  }

  today = () => new Date();




trackById = (_: number, a: DocAttachment) => a.id;



// داخل EmployeeDocumentsComponent

private objectUrlCache = new Map<string, string>();

private dataUrlToBlobUrl(dataUrl: string): string {
  const [header, base64] = dataUrl.split(',');
  const mime = /data:(.*?);base64/.exec(header)?.[1] || 'application/octet-stream';
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob);
}

private ensureObjectUrl(a: DocAttachment): string {
  if (a.remoteUrl) return a.remoteUrl;          // عند الربط مع السيرفر
  if (!a.dataUrl) return '';
  let url = this.objectUrlCache.get(a.id);
  if (!url) {
    url = this.dataUrlToBlobUrl(a.dataUrl);
    this.objectUrlCache.set(a.id, url);
  }
  return url;
}

displayUrl(a: DocAttachment): string {
  return a.remoteUrl || this.ensureObjectUrl(a);
}

ngOnDestroy() {
  // نظافة: إلغاء URLs المؤقتة
  for (const url of this.objectUrlCache.values()) URL.revokeObjectURL(url);
  this.objectUrlCache.clear();
}



iconFor(mime: string): string {
  if (!mime) return 'insert_drive_file';
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'picture_as_pdf';
  return 'insert_drive_file';
}

formatSize(bytes: number | null | undefined): string {
  const b = typeof bytes === 'number' ? bytes : 0;
  if (b < 1024) return `${b} B`;
  const kb = b / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

}



