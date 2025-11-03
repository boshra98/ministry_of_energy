


// src/app/pipes/org-name.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

/** شجرة عامة تدعم أي عمق */
export interface OrgNode { code: string; name: string; subs?: OrgNode[]; }

type Mode = 'leaf' | 'path';
type Opts = { tree?: OrgNode[]; mode?: Mode; sep?: string };

//pure  من اجل المرجع في الشجرة
//هذا يعني أنها لن تُعاد إلا إذا تغيّر مرجع (reference) الشجرة.
@Pipe({ name: 'orgName', standalone: true, pure: true })
export class OrgNamePipe implements PipeTransform {
  transform(codePath: string | null | undefined, opts: Opts = {}): string {
    const tree: OrgNode[] = opts.tree ?? [];
    const mode: Mode = opts.mode ?? 'leaf';
    const sep = opts.sep ?? ' | ';

    if (!codePath) return '—';

    // ادعم إما كود منفرد أو مسار مفصول بـ | / >
    const parts = String(codePath)
      .split(/[|/>]/)
      .map(s => s.trim())
      .filter(Boolean);

    if (!parts.length) return '—';

    // لو أُعطي كود منفرد، جرّب إيجاده مباشرة
    if (parts.length === 1) {
      const node = this.findByCode(tree, parts[0]);
      if (!node) return parts[0]; // fallback إلى الكود
      if (mode === 'path') {
        const path = this.buildPathNamesByCode(tree, parts[0]);
        return path ? path.join(sep) : node.name;
      }
      return node.name; // leaf
    }

    // لو مسار مركّب، امشِ خطوة بخطوة
    const names: string[] = [];
    let current: OrgNode[] = tree;
    let last: OrgNode | undefined;

    for (const part of parts) {
      const hit = current.find(n => n.code === part);
      if (!hit) {
        // لو انقطعت السلسلة، حاول عرض أفضل ما أمكن
        if (mode === 'path') return names.length ? names.join(sep) : part;
        const fallback = this.findByCode(tree, parts.at(-1)!);
        return fallback?.name ?? parts.at(-1)!;
      }
      names.push(hit.name);
      last = hit;
      current = hit.subs ?? [];
    }

    return mode === 'path' ? names.join(sep) : (last?.name ?? names.at(-1)!);
  }

  /** بحث عميق بالـ code */
  private findByCode(tree: OrgNode[], code: string): OrgNode | null {
    for (const node of tree) {
      if (node.code === code) return node;
      if (node.subs?.length) {
        const hit = this.findByCode(node.subs, code);
        if (hit) return hit;
      }
    }
    return null;
  }

  /** يبني أسماء المسار الكامل حتى العقدة المطلوبة */
  private buildPathNamesByCode(tree: OrgNode[], code: string): string[] | null {
    const path: string[] = [];
    const ok = this.dfsBuildPath(tree, code, path);
    return ok ? path : null;
  }

  private dfsBuildPath(nodes: OrgNode[], target: string, acc: string[]): boolean {
    for (const n of nodes) {
      acc.push(n.name);
      if (n.code === target) return true;
      if (n.subs?.length && this.dfsBuildPath(n.subs, target, acc)) return true;
      acc.pop();
    }
    return false;
  }
}
