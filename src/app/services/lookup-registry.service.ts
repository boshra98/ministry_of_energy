// services/lookup-registry.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { LOOKUP_SEEDS } from '../data/lookup.seeds';
import { LookupKey, LookupOption, LookupSeedOption } from '../models/lookup.models';
import { LocalStoragePersistence } from '../core/lookup.persistence.local';
import { LookupPersistence } from '../core/lookup.persistence';

// للتوافق والقراءة
type StoreMap = Map<LookupKey, BehaviorSubject<LookupOption[]>>;

// ترتيب افتراضي: حسب order ثم label
function sortOptions(a: LookupOption, b: LookupOption) {
  const ao = a.order ?? 0, bo = b.order ?? 0;
  if (ao !== bo) return ao - bo;
  return a.label.localeCompare(b.label, 'ar');
}

function normalizeList(list: (LookupOption | LookupSeedOption)[]): LookupOption[] {
  const base = list.map((o, i) => ({
    id: 'id' in o && o.id ? o.id : uuid(),
    value: (o.value ?? '').trim(),
    label: (o.label ?? '').trim(),
    order: typeof (o as LookupOption).order === 'number' ? (o as LookupOption).order : i,
    locked: !!o.locked,
    disabled: !!o.disabled,
    meta: o.meta ?? {},
  }));

  // فلترة الفارغ + التكرار + ترتيب …
  const nonEmpty = base.filter(o => o.value && o.label);
  const seen = new Set<string>();
  const unique = nonEmpty.filter(o => {
    const k = o.value.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  unique.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label, 'ar'));
  return unique;
}


@Injectable({ providedIn: 'root' })
export class LookupRegistryService {
  private store: StoreMap = new Map();
  private persistence: LookupPersistence = new LocalStoragePersistence();

  // رقم إصدار للـ export/import (مفيد للتوافق لاحقًا)
  private readonly EXPORT_VERSION = 1;

  constructor() {
    // ابدأ كل المفاتيح: حاول التحميل، وإن فشل استخدم seed
    (Object.keys(LOOKUP_SEEDS) as LookupKey[]).forEach(async (key) => {
      const subject = new BehaviorSubject<LookupOption[]>([]);
      this.store.set(key, subject);

      try {
        const saved = await this.persistence.load(key);
        // const initial = normalizeList(saved ?? (LOOKUP_SEEDS as Record<LookupKey, LookupOption[]>)[key]);
        const initial = normalizeList(saved ?? (LOOKUP_SEEDS as Record<LookupKey, LookupSeedOption[]>)[key]);

        subject.next(initial);
        await this.persistence.save(key, initial); // ضمان حفظ النسخة المنظّفة
      } catch (e) {
        // fallback للـ seed عند أي خطأ
        // const seed = normalizeList((LOOKUP_SEEDS as Record<LookupKey, LookupOption[]>)[key]);
        const seed = normalizeList((LOOKUP_SEEDS as Record<LookupKey, LookupSeedOption[]>)[key]);

        subject.next(seed);
        try { await this.persistence.save(key, seed); } catch { /* تجاهل */ }
      }
    });
  }

  /** مراقبة قائمة مفتاح معيّن */
  list$(key: LookupKey): Observable<LookupOption[]> {
    const subj = this.store.get(key);
    if (!subj) return throwError(() => new Error(`Unknown lookup key: ${key}`));
    return subj.asObservable();
  }

  /** الحصول على القائمة (نسخة) */
  get(key: LookupKey): LookupOption[] {
    const subj = this.store.get(key);
    if (!subj) throw new Error(`Unknown lookup key: ${key}`);
    return [...subj.getValue()];
  }

  /** commit مع تطبيع وترتيب + حفظ */
  private async commit(key: LookupKey, items: LookupOption[]) {
    const subj = this.store.get(key);
    if (!subj) throw new Error(`Unknown lookup key: ${key}`);

    const current = subj.getValue();
    const normalized = normalizeList(items);

    // تفاؤلي: حدث الواجهة أولاً
    subj.next(normalized);

    try {
      await this.persistence.save(key, normalized);
    } catch (e) {
      // rollback إذا فشل الحفظ
      subj.next(current);
      throw e;
    }
  }

  /** إضافة عنصر جديد */
  async add(
  key: LookupKey,
  payload: Omit<LookupOption, 'id' | 'order'>
): Promise<LookupOption | null> {
  const items = this.get(key);

  // 1) تطبيع الإدخال
  const value = (payload.value ?? '').trim();
  const label = (payload.label ?? '').trim();

  // 2) تحقق من الفراغ
  if (!value || !label) {
    // إمّا ترمي خطأ أو ترجع null
    return null;
  }

  // 3) منع التكرار بالقيمة (case-insensitive)
  const exists = items.some(x => x.value.toLowerCase() === value.toLowerCase());
  if (exists) {
    // إمّا throw new Error('DUPLICATE') أو null
    return null;
  }

  // 4) احسب order بأخذ أكبر قيمة حالية + 1 (أكثر أمانًا من الاعتماد على آخر عنصر)
  const nextOrder =
    items.length
      ? Math.max(...items.map(i => (i.order ?? 0))) + 1
      : 0;

  // 5) كوّن العنصر الجديد
  const next: LookupOption = {
    id: uuid(),
    value,
    label,
    locked: !!payload.locked,
    disabled: !!payload.disabled,
    meta: payload.meta ?? {},
    order: nextOrder,
  };

  // 6) خزّن
  await this.commit(key, [...items, next]);

  // 7) أرجع المضاف (مفيد لمن ينادي الدالة)
  return next;
}


  /** تعديل عنصر موجود */
  async update(key: LookupKey, id: string, patch: Partial<LookupOption>) {
  const items = this.get(key);
  const idx = items.findIndex(x => x.id === id);
  if (idx < 0) return;

  const base = items[idx];
  const isLocked = !!base.locked;

  // احسب القيم النهائية المؤكدة كـ string
  const nextValRaw = typeof patch.value === 'string' ? patch.value.trim() : undefined;
  const finalValue = (isLocked && nextValRaw && nextValRaw !== base.value)
    ? base.value
    : (nextValRaw ?? base.value);

  const nextLabelRaw = typeof patch.label === 'string' ? patch.label.trim() : undefined;
  const finalLabel: string = nextLabelRaw ?? base.label; // ← لا يمكن أن تكون undefined

  // منع التكرار بالقيمة
  if (finalValue !== base.value) {
    const dup = items.some((x, i) => i !== idx && x.value.toLowerCase() === finalValue.toLowerCase());
    if (dup) return;
  }

  const nextItem: LookupOption = {
    ...base,
    ...patch,
    value: finalValue,
    label: finalLabel,
  };

  const next = [...items];
  next[idx] = nextItem;
  await this.commit(key, next);
}


  /** حذف عنصر (مع احترام locked) */
 async remove(key: LookupKey, id: string) {
  const items = this.get(key);
  const it = items.find(x => x.id === id);
  if (!it || it.locked) return;
  await this.commit(key, items.filter(x => x.id !== id));
}

async reorder(key: LookupKey, orderedIds: string[]) {
  const dict = new Map(this.get(key).map(x => [x.id, x]));
  const next: LookupOption[] = [];

  orderedIds.forEach((id, idx) => {
    const it = dict.get(id);
    if (!it) return;
    next.push({ ...it, order: idx });
    dict.delete(id);
  });

  if (dict.size) {
    // ألحق المفقودين بترتيبهم الحالي
    const rest = [...dict.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    rest.forEach((it, i) => next.push({ ...it, order: next.length + i }));
  }

  await this.commit(key, next);
}


  /** استعادة افتراضيات مفتاح واحد */
  // async resetToDefaults(key: LookupKey) {
  //   const seed = normalizeList((LOOKUP_SEEDS as Record<LookupKey, LookupOption[]>)[key]);
  //   await this.commit(key, seed);
  // }
  async resetToDefaults(key: LookupKey) {
  // لاحظ: LOOKUP_SEEDS يجب أن يكون نوعه LookupSeedOption[] وليس LookupOption[]
  const seedRaw = (LOOKUP_SEEDS as Record<LookupKey, LookupSeedOption[]>)[key];
  const seed = normalizeList(seedRaw); // ← ترجع LookupOption[] مع label/value مؤكدة
  await this.commit(key, seed);
}


  /** استعادة جميع المفاتيح للافتراضيات */
  async resetAll() {
    for (const key of this.store.keys()) {
      await this.resetToDefaults(key);
    }
  }

  /** استيراد قائمة (JSON) لمفتاح واحد */
  async import(key: LookupKey, json: string) {
    // يدعم شكلين:
    // 1) مصفوفة مباشرة LookupOption[]
    // 2) كائن { version, items }
    let parsed: any = JSON.parse(json);
    let items: LookupOption[];

    if (Array.isArray(parsed)) {
      items = parsed as LookupOption[];
    } else if (parsed && Array.isArray(parsed.items)) {
      // مستقبلاً: تحكم بحسب parsed.version
      items = parsed.items as LookupOption[];
    } else {
      throw new Error('Invalid import format');
    }

    const sanitized = normalizeList(items);
    await this.commit(key, sanitized);
  }

  /** تصدير قائمة (مع رقم إصدار) */
  export(key: LookupKey) {
    const payload = {
      version: this.EXPORT_VERSION,
      key,
      exportedAt: new Date().toISOString(),
      items: this.get(key),
    };
    return JSON.stringify(payload, null, 2);
  }

  /** أدوات إضافية اختيارية */
  findByValue(key: LookupKey, value: string): LookupOption | undefined {
    const v = (value ?? '').trim().toLowerCase();
    return this.get(key).find(x => x.value.toLowerCase() === v);
  }

  upsert(key: LookupKey, opt: Omit<LookupOption, 'id' | 'order'>) {
    const found = this.findByValue(key, opt.value);
    return found
      ? this.update(key, found.id!, { label: opt.label, disabled: opt.disabled, meta: opt.meta })
      : this.add(key, opt);
  }
}
