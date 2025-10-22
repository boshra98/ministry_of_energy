// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-departments-editor',
//   imports: [],
//   templateUrl: './departments-editor.component.html',
//   styleUrl: './departments-editor.component.scss'
// })
// export class DepartmentsEditorComponent {

// }


// components/departments-editor/departments-editor.component.ts
// import { Component } from '@angular/core';
// import { OrgTreeService } from '../services/org-tree.service';
// import { OrgNode } from '../models/department';
// import { FlatTreeControl } from '@angular/cdk/tree';
// import { MatTreeModule, MatTreeFlatDataSource, MatTreeFlattener, MatTree, MatTreeNode } from '@angular/material/tree';
// import { MatIcon } from '@angular/material/icon';

// interface FlatNode { expandable: boolean; name: string; code: string; level: number; }

// @Component({
//   selector: 'app-departments-editor',
//    standalone: true,
//   templateUrl: './departments-editor.component.html',
//   imports: [MatTree, MatTreeNode, MatIcon],
// })
// export class DepartmentsEditorComponent {
//   private _transformer = (node: OrgNode, level: number): FlatNode => ({
//     expandable: !!node.subs && node.subs.length > 0,
//     name: node.name,
//     code: node.code,
//     level,
//   });

//   treeControl = new FlatTreeControl<FlatNode>(n => n.level, n => n.expandable);
//   treeFlattener = new MatTreeFlattener<OrgNode, FlatNode>(
//     this._transformer, n => n.level, n => n.expandable, n => n.subs ?? []
//   );
//   dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

//   constructor(public org: OrgTreeService) {
//     this.org.tree$.subscribe(d => this.dataSource.data = d);
//   }

//   hasChild = (_: number, node: FlatNode) => node.expandable;

//   addChild(parent: FlatNode) {
//     const code = prompt('Code؟');
//     const name = prompt('الاسم؟');
//     if (!code || !name) return;
//     this.org.upsert({ code, name, subs: [] }, parent.code);
//   }

//   edit(node: FlatNode) {
//     const name = prompt('اسم جديد؟', node.name);
//     if (!name) return;
//     this.org.upsert({ code: node.code, name, subs: [] }); // تبسيط: يعتمد على upsert الذكي
//   }

//   remove(node: FlatNode) {
//     if (confirm('حذف القسم وكامل فروعه؟')) this.org.remove(node.code);
//   }
// }



import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeModule, MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { OrgTreeService } from '../services/org-tree.service';
import { OrgNode } from '../models/department';
import { combineLatest, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatInputModule } from "@angular/material/input";


interface FlatNode {
  expandable: boolean;
  name: string;
  code: string;
  level: number;
}

@Component({
  selector: 'app-departments-editor',
  standalone: true,
  templateUrl: './departments-editor.component.html',
  styleUrls: ['./departments-editor.component.scss'],
  imports: [CommonModule, MatTreeModule, MatIconModule, MatButtonModule, MatInputModule],
})
export class DepartmentsEditorComponent {
  /** يحوّل OrgNode إلى FlatNode */
   searchCtrl = new FormControl('', { nonNullable: true });

  private transformer = (node: OrgNode, level: number): FlatNode => ({
    expandable: !!node.subs && node.subs.length > 0,
    name: node.name, code: node.code, level,
  });

  treeControl = new FlatTreeControl<FlatNode>(n => n.level, n => n.expandable);
  treeFlattener = new MatTreeFlattener<OrgNode, FlatNode>(
    this.transformer, n => n.level, n => n.expandable, n => n.subs ?? []
  );
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(public org: OrgTreeService) {
    // فلترة الشجرة حسب البحث + فتح كل العقد عند وجود استعلام
    combineLatest([
      this.org.tree$,
      this.searchCtrl.valueChanges.pipe(startWith('')),
    ]).subscribe(([tree, q]) => {
      const filtered = this.filterTree(tree ?? [], q ?? '');
      this.dataSource.data = filtered;
      if (q) this.treeControl.expandAll(); else this.treeControl.collapseAll();
    });
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  private filterTree(nodes: OrgNode[], q: string): OrgNode[] {
    const s = q.trim().toLowerCase();
    if (!s) return nodes;
    const walk = (arr: OrgNode[]): OrgNode[] => {
      const out: OrgNode[] = [];
      for (const n of arr) {
        const kids = n.subs ? walk(n.subs) : [];
        const match = n.name.toLowerCase().includes(s) || n.code.toLowerCase().includes(s);
        if (match || kids.length) out.push({ ...n, subs: kids });
      }
      return out;
    };
    return walk(nodes);
  }

  // أزرار التولبار:
  resetDefaults() { this.org.resetToDefaults(); }
  export() {
    const blob = new Blob([this.org.export()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'departments.json'; a.click();
    URL.revokeObjectURL(url);
  }
  onFileInput(input: HTMLInputElement) {
    const f = input.files?.item(0); if (!f) return;
    f.text().then(txt => this.org.import(txt));
    input.value = '';
  }

  // CRUD مبسطة:
  addChild(node: FlatNode) {
    const code = prompt('Code؟'); const name = prompt('الاسم؟');
    if (!code || !name) return;
    this.org.upsert({ code, name, subs: [] }, node.code);
  }
  edit(node: FlatNode) {
    const name = prompt('اسم جديد؟', node.name);
    if (!name) return;
    this.org.upsert({ code: node.code, name, subs: [] });
  }
  remove(node: FlatNode) {
    if (confirm('حذف القسم وكامل فروعه؟')) this.org.remove(node.code);
  }
}