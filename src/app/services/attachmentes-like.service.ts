// src/app/services/attachments-like.service.ts
import { Injectable } from '@angular/core';
import {
  LocalEmployeesService,
  DocAttachment,
  DocAttachmentType,
  Employee,
  EmployeeUpdate,
} from './local-employees.service';

export abstract class AttachmentsServiceLike {
  abstract listAll(employeeId: string): DocAttachment[];
  abstract listByType(employeeId: string, type: DocAttachmentType): DocAttachment[];
  abstract add(employeeId: string, file: File, type: DocAttachmentType, note?: string): Promise<void>;
  abstract upsert(employeeId: string, file: File, type: DocAttachmentType, note?: string): Promise<void>;
  abstract replace(employeeId: string, attachmentId: string, file: File): Promise<void>;
  abstract remove(employeeId: string, attachmentId: string): void;
}

@Injectable({ providedIn: 'root' })
export class LocalAttachmentsAdapterService extends AttachmentsServiceLike {
  constructor(private emps: LocalEmployeesService) { super(); }

  // ---------- Helpers ----------
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = () => reject(fr.error);
      fr.readAsDataURL(file);
    });
  }

  private getEmployeeOrThrow(employeeId: string): Employee {
    const emp = this.emps.list().find(e => e.id === employeeId);
    if (!emp) throw new Error('Employee not found');
    // تأكد من وجود المصفوفة
    emp.attachments = Array.isArray(emp.attachments) ? emp.attachments : [];
    return emp;
  }

  private saveEmployee(emp: Employee) {
    const patch: EmployeeUpdate = { id: emp.id, attachments: emp.attachments, updatedAt: new Date() as any };
    // update لدينا يستبدل details فقط بشكل خاص، لكن انتشار الحقول سيأخذ attachments من الـ patch
    this.emps.update(patch);
  }

  // ---------- Queries ----------
  listAll(employeeId: string): DocAttachment[] {
    try {
      const emp = this.getEmployeeOrThrow(employeeId);
      return emp.attachments ?? [];
    } catch { return []; }
  }

  listByType(employeeId: string, type: DocAttachmentType): DocAttachment[] {
    return this.listAll(employeeId).filter(a => a.type === type);
  }

  // ---------- Mutations ----------
  async add(employeeId: string, file: File, type: DocAttachmentType, note?: string): Promise<void> {
    const emp = this.getEmployeeOrThrow(employeeId);
    const dataUrl = await this.fileToDataUrl(file);
    const att: DocAttachment = {
      id: crypto.randomUUID?.() ?? `att_${Date.now()}`,
      type,
      name: file.name,
      mime: (file.type as any) || 'application/octet-stream',
      size: file.size,
      dataUrl,
      uploadedAt: new Date().toISOString(),
      note,
      storage: 'local',
    };
    emp.attachments!.push(att);
    this.saveEmployee(emp);
  }

  async upsert(employeeId: string, file: File, type: DocAttachmentType, note?: string): Promise<void> {
    const emp = this.getEmployeeOrThrow(employeeId);
    const dataUrl = await this.fileToDataUrl(file);

    // احذف أي عنصر من نفس النوع (نحتفظ بواحد فقط لكل نوع)
    emp.attachments = (emp.attachments ?? []).filter(a => a.type !== type);

    emp.attachments.push({
      id: crypto.randomUUID?.() ?? `att_${Date.now()}`,
      type,
      name: file.name,
      mime: (file.type as any) || 'application/octet-stream',
      size: file.size,
      dataUrl,
      uploadedAt: new Date().toISOString(),
      note,
      storage: 'local',
    });

    this.saveEmployee(emp);
  }

  async replace(employeeId: string, attachmentId: string, file: File): Promise<void> {
    const emp = this.getEmployeeOrThrow(employeeId);
    const atts = emp.attachments ?? [];
    const i = atts.findIndex(a => a.id === attachmentId);
    if (i === -1) return;

    const dataUrl = await this.fileToDataUrl(file);
    const prev = atts[i];
    atts[i] = {
      ...prev,
      name: file.name,
      mime: (file.type as any) || prev.mime,
      size: file.size,
      dataUrl,
      uploadedAt: new Date().toISOString(),
      storage: 'local',
    };
    this.saveEmployee(emp);
  }

  remove(employeeId: string, attachmentId: string): void {
    const emp = this.getEmployeeOrThrow(employeeId);
    const before = emp.attachments ?? [];
    emp.attachments = before.filter(a => a.id !== attachmentId);
    if (emp.attachments.length !== before.length) {
      this.saveEmployee(emp);
    }
  }
}
