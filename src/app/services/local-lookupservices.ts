// import { Injectable } from '@angular/core';
// import { LookupItem, LookupKind, LookupService } from './lookup.service';

// const STORAGE_KEY = 'lookups_v1';

// type StoreShape = Record<LookupKind, LookupItem[]>;

// function readStore(): StoreShape {
//   const raw = localStorage.getItem(STORAGE_KEY);
//   if (raw) {
//     try { return JSON.parse(raw) as StoreShape; } catch { /* ignore */ }
//   }
//   // قيم نظامية ابتدائية (عدّلها كما تريد)
//   return {
//     nationality: [
//       { id: crypto.randomUUID(), label: 'سوري',   source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'لبناني', source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'مصري',   source: 'system', active: true },
//     ],
//     jobTitle: [
//       { id: crypto.randomUUID(), label: 'مدرّس',  source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'محاسب',  source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'مبرمج',  source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'مدير',   source: 'system', active: true },
//     ],
//     education: [
//       { id: crypto.randomUUID(), label: 'ابتدائي',     source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'ثانوي',       source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'بكالوريوس',   source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'ماستر',       source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'دكتوراه',     source: 'system', active: true },
//     ],
//     bloodType: [
//       { id: crypto.randomUUID(), label: 'A+', source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'A-', source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'B+', source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'B-', source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'AB+', source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'AB-', source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'O+', source: 'system', active: true },
//       { id: crypto.randomUUID(), label: 'O-', source: 'system', active: true },
//     ],
//   };
// }

// function writeStore(store: StoreShape) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
// }

// @Injectable({ providedIn: 'root' })
// export class LocalLookupService extends LookupService {
//   private store: StoreShape = readStore();

//   async list(kind: LookupKind): Promise<LookupItem[]> {
//     const items = this.store[kind] ?? [];
//     // فرز عربي لطيف
//     return [...items]
//       .filter(x => x.active)
//       .sort((a, b) => a.label.localeCompare(b.label, 'ar'));
//   }

//   async add(kind: LookupKind, label: string): Promise<LookupItem> {
//     const clean = label.trim();
//     if (!clean) throw new Error('Empty label');

//     // منع التكرار (case-insensitive)
//     const exists = (this.store[kind] ?? []).some(
//       x => x.label.toLowerCase() === clean.toLowerCase()
//     );
//     if (exists) {
//       // أرجع الموجود (أو اعتبرها نجاح صامت)
//       const found = (this.store[kind] ?? []).find(
//         x => x.label.toLowerCase() === clean.toLowerCase()
//       )!;
//       return found;
//     }

//     const item: LookupItem = {
//       id: crypto.randomUUID(),
//       label: clean,
//       source: 'user',
//       active: true,
//     };
//     this.store[kind] = [...(this.store[kind] ?? []), item];
//     writeStore(this.store);
//     return item;
//   }

//   // أمثلة اختيارية
//    async remove(kind: LookupKind, id: string): Promise<void> {
//     const list = this.store[kind] ?? [];
//     this.store[kind] = list.map(x => x.id === id ? { ...x, active: false } : x);
//     writeStore(this.store);
//   }

//   override async update(kind: LookupKind, item: LookupItem): Promise<LookupItem> {
//     const list = this.store[kind] ?? [];
//     const idx = list.findIndex(x => x.id === item.id);
//     if (idx >= 0) {
//       list[idx] = { ...item };
//       this.store[kind] = list;
//       writeStore(this.store);
//       return item;
//     }
//     throw new Error('Not found');
//   }
// }
