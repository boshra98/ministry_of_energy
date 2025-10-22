// core/lookup.persistence.ts
import { LookupKey, LookupOption } from '../models/lookup.models';

export interface LookupPersistence {
  load(key: LookupKey): Promise<LookupOption[] | null>;
  save(key: LookupKey, items: LookupOption[]): Promise<void>;
}
