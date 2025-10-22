

// services/lookup-registry.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { LOOKUP_SEEDS } from '../data/lookup.seeds';
import { LookupKey, LookupOption } from '../models/lookup.models';
import { LocalStoragePersistence } from '../core/lookup.persistence.local';
import { LookupPersistence } from '../core/lookup.persistence';

@Injectable({ providedIn: 'root' })
export class LookupRegistryService {
  private store = new Map<LookupKey, BehaviorSubject<LookupOption[]>>();
  private persistence: LookupPersistence = new LocalStoragePersistence();

  constructor() {
    (Object.keys(LOOKUP_SEEDS) as LookupKey[]).forEach(async (key) => {
      const subject = new BehaviorSubject<LookupOption[]>([]);
      this.store.set(key, subject);

      const saved = await this.persistence.load(key);
      subject.next(saved ?? LOOKUP_SEEDS[key]);
    });
  }

  list$(key: LookupKey) {
    return this.store.get(key)!.asObservable();
  }

  get(key: LookupKey): LookupOption[] {
    return this.store.get(key)!.getValue();
  }

  private async commit(key: LookupKey, items: LookupOption[]) {
    this.store.get(key)!.next(items);
    await this.persistence.save(key, items);
  }

  add(key: LookupKey, payload: Omit<LookupOption, 'id' | 'order'>) {
    const items = this.get(key);
    const next: LookupOption = {
      id: uuid(),
      value: payload.value.trim(),
      label: payload.label.trim(),
      locked: !!payload.locked,
      order: (items.at(-1)?.order ?? -1) + 1,
    };
    return this.commit(key, [...items, next]);
  }

  update(key: LookupKey, id: string, patch: Partial<LookupOption>) {
    const items = this.get(key).map(it => it.id === id ? { ...it, ...patch } : it);
    return this.commit(key, items);
  }

  remove(key: LookupKey, id: string) {
    const items = this.get(key);
    const it = items.find(x => x.id === id);
    if (it?.locked) return; // لا تحذف الافتراضيات المحميّة
    return this.commit(key, items.filter(x => x.id !== id));
  }

  reorder(key: LookupKey, orderedIds: string[]) {
    const dict = new Map(this.get(key).map(x => [x.id, x]));
    const next = orderedIds.map((id, idx) => ({ ...dict.get(id)!, order: idx }));
    return this.commit(key, next);
  }

  resetToDefaults(key: LookupKey) {
    return this.commit(key, LOOKUP_SEEDS[key]);
  }

  import(key: LookupKey, json: string) {
    const parsed = JSON.parse(json) as LookupOption[];
    // تأكّد من وجود id/order أو توليدهما
    const sanitized = parsed.map((x, i) => ({
      id: x.id ?? uuid(),
      value: x.value?.trim() ?? '',
      label: x.label?.trim() ?? '',
      locked: !!x.locked,
      order: x.order ?? i,
    }));
    return this.commit(key, sanitized);
  }

  export(key: LookupKey) {
    return JSON.stringify(this.get(key), null, 2);
  }
}
