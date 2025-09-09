// org-name.pipe.ts
// 

// org-name.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { Dept } from '../models/department';

type Mode = 'leaf' | 'path';
type Opts = { tree?: Dept[]; mode?: Mode; sep?: string };

@Pipe({ name: 'orgName', standalone: true, pure: true })
export class OrgNamePipe implements PipeTransform {
  transform(codePath: string | null | undefined, opts: Opts = {}): string {
    const tree = opts.tree ?? [];
    const mode: Mode = opts.mode ?? 'leaf';
    const sep = opts.sep ?? ' | ';

    if (!codePath) return '—';

    const parts = String(codePath)
      .split(/[|/>]/)
      .map(s => s.trim())
      .filter(Boolean);

    if (!parts.length) return '—';

    // مطابقة مباشرة
    const direct = this.findByCode(tree, codePath);
    if (direct) {
      return mode === 'path'
        ? this.buildPathNamesByCode(tree, codePath)?.join(sep) ?? direct.name
        : direct.name;
    }

    // مطابقة مسار مركّب
    const names: string[] = [];
    let current: Dept[] = tree;
    let last: Dept | undefined;

    for (const part of parts) {
      const hit = current.find(n => n.code === part);
      if (!hit) {
        const fallback = this.findByCode(tree, parts.at(-1)!);
        if (mode === 'path') {
          if (names.length) return names.join(sep);
          return fallback?.name ?? parts.at(-1)!;
        }
        return fallback?.name ?? parts.at(-1)!;
      }
      names.push(hit.name);
      last = hit;
      current = (hit.subs as unknown as Dept[]) || [];
    }

    return mode === 'path' ? names.join(sep) : (last?.name ?? names.at(-1)!);
  }

  private findByCode(tree: Dept[], code: string): Dept | null {
    for (const node of tree) {
      if (node.code === code) return node;
      if (node.subs?.length) {
        const hit = this.findByCode(node.subs as unknown as Dept[], code);
        if (hit) return hit;
      }
    }
    return null;
  }

  private buildPathNamesByCode(tree: Dept[], code: string): string[] | null {
    const path: string[] = [];
    const ok = this.dfsBuildPath(tree, code, path);
    return ok ? path : null;
  }

  private dfsBuildPath(nodes: Dept[], target: string, acc: string[]): boolean {
    for (const n of nodes) {
      acc.push(n.name);
      if (n.code === target) return true;
      if (n.subs?.length && this.dfsBuildPath(n.subs as unknown as Dept[], target, acc)) {
        return true;
      }
      acc.pop();
    }
    return false;
  }
}
