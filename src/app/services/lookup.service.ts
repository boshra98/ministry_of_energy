// export type LookupKind = 'nationality' | 'jobTitle' | 'education' | 'bloodType';

// export interface LookupItem {
//   id: string;                 // UUID محلي الآن
//   label: string;              // النص المعروض
//   source: 'system'|'user';    // مصدر (نظامي/مضاف من المستخدم)
//   active: boolean;            // لتعطيل خيار بدل حذفه
// }

// export abstract class LookupService {
//   abstract list(kind: LookupKind): Promise<LookupItem[]>;
//   abstract add(kind: LookupKind, label: string): Promise<LookupItem>;
//   // اختياري
//   update?(kind: LookupKind, item: LookupItem): Promise<LookupItem>;
//   remove?(kind: LookupKind, id: string): Promise<void>;
// }
