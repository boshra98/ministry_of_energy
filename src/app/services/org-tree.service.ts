// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import { DEPARTMENTS, OrgNode } from '../models/department'; // نموذجي الحالي
// import { LocalStoragePersistence } from '../core/lookup.persistence.local';

// const KEY = 'ORG_TREE';

// @Injectable({ providedIn: 'root' })
// export class OrgTreeService {
//   private subject = new BehaviorSubject<OrgNode[]>([]);
//   tree$ = this.subject.asObservable();
//   private persist = new LocalStoragePersistence();

// //   constructor() {
// //     const saved = localStorage.getItem(KEY);
// //     if (saved) this.subject.next(JSON.parse(saved));
// //     else this.subject.next( DEPARTMENTS );
// //   }

// //حقن قبل الاستخدام
// //خزّن الـ seed فورًا في LocalStorage عند أول تشغيل، حتى يظل المصدر ثابتًا بعد إعادة التحميل.
// constructor() {
//   const saved = localStorage.getItem(KEY);
//   if (saved) {
//     this.subject.next(JSON.parse(saved) as OrgNode[]);
//   } else {
//     const seed = structuredClone(DEPARTMENTS); // أو: JSON.parse(JSON.stringify(DEPARTMENTS))
//     this.subject.next(seed);
//     localStorage.setItem(KEY, JSON.stringify(seed)); // مهم
//   }
// }


//   private save() {
//     localStorage.setItem(KEY, JSON.stringify(this.subject.getValue()));
//   }

//   get(): OrgNode[] { return this.subject.getValue(); }

//   upsert(node: OrgNode, parentCode?: string) {
//     const tree = structuredClone(this.get());

//     const find = (arr: OrgNode[], code: string): OrgNode | undefined => {
//       for (const n of arr) {
//         if (n.code === code) return n;
//         const hit = n.subs && find(n.subs, code);
//         if (hit) return hit;
//       }
//       return undefined;
//     };

//     if (!parentCode) {
//       // جذر
//       const idx = tree.findIndex(n => n.code === node.code);
//       if (idx >= 0) tree[idx] = node; else tree.push(node);
//     } else {
//       const parent = find(tree, parentCode);
//       if (!parent) return;
//       parent.subs ??= [];
//       const idx = parent.subs.findIndex(n => n.code === node.code);
//       if (idx >= 0) parent.subs[idx] = node; else parent.subs.push(node);
//     }

//     this.subject.next(tree);
//     this.save();
//   }

//   remove(code: string) {
//     const prune = (arr: OrgNode[]): OrgNode[] =>
//       arr.filter(n => n.code !== code).map(n => ({ ...n, subs: n.subs ? prune(n.subs) : undefined }));

//     const next = prune(this.get());
//     this.subject.next(next);
//     this.save();
//   }
  
// }



// services/org-tree.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OrgNode, DEPARTMENTS } from '../models/department';

const KEY = 'ORG_TREE_V1';

function normalize(nodes: OrgNode[]): OrgNode[] {
  return nodes.map(n => ({ code: n.code, name: n.name, subs: n.subs?.length ? normalize(n.subs) : [] }));
}

@Injectable({ providedIn: 'root' })
export class OrgTreeService {
  private subject = new BehaviorSubject<OrgNode[]>([]);
  tree$ = this.subject.asObservable();

  constructor() {
    const saved = localStorage.getItem(KEY);
    if (saved) this.subject.next(JSON.parse(saved));
    else {
      const seed = normalize(structuredClone(DEPARTMENTS));
      this.subject.next(seed);
      localStorage.setItem(KEY, JSON.stringify(seed));
    }
  }

  private save() {
    localStorage.setItem(KEY, JSON.stringify(this.subject.getValue()));
  }

  get(): OrgNode[] { return this.subject.getValue(); }

  upsert(node: OrgNode, parentCode?: string) {
    const tree = structuredClone(this.get());
    const find = (arr: OrgNode[], c: string): OrgNode | undefined => {
      for (const n of arr) {
        if (n.code === c) return n;
        const hit = n.subs && find(n.subs, c);
        if (hit) return hit;
      }
      return undefined;
    };

    if (!parentCode) {
      const i = tree.findIndex(n => n.code === node.code);
      if (i >= 0) tree[i] = { ...tree[i], ...node };
      else tree.push({ ...node, subs: node.subs ?? [] });
    } else {
      const p = find(tree, parentCode);
      if (!p) return;
      p.subs ??= [];
      const i = p.subs.findIndex(n => n.code === node.code);
      if (i >= 0) p.subs[i] = { ...p.subs[i], ...node };
      else p.subs.push({ ...node, subs: node.subs ?? [] });
    }

    this.subject.next(tree);
    this.save();
  }

  remove(code: string) {
    const prune = (arr: OrgNode[]): OrgNode[] =>
      arr.filter(n => n.code !== code).map(n => ({ ...n, subs: prune(n.subs ?? []) }));
    this.subject.next(prune(this.get()));
    this.save();
  }

  // الجديد:
  resetToDefaults() {
    const seed = normalize(structuredClone(DEPARTMENTS));
    this.subject.next(seed);
    localStorage.setItem(KEY, JSON.stringify(seed));
  }

  export(): string {
    return JSON.stringify(this.get(), null, 2);
  }

  import(json: string) {
    const parsed = JSON.parse(json) as OrgNode[];
    const norm = normalize(parsed);
    this.subject.next(norm);
    this.save();
  }
}

