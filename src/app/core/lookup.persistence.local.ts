// core/lookup.persistence.local.ts
import { LookupKey, LookupOption } from '../models/lookup.models';
import { LookupPersistence } from './lookup.persistence';

const NS = 'hr.lookups';

export class LocalStoragePersistence implements LookupPersistence {
  async load(key: LookupKey): Promise<LookupOption[] | null> {
    const raw = localStorage.getItem(`${NS}.${key}`);
    return raw ? (JSON.parse(raw) as LookupOption[]) : null;
  }

  async save(key: LookupKey, items: LookupOption[]): Promise<void> {
    localStorage.setItem(`${NS}.${key}`, JSON.stringify(items));
  }
}
