import { ChangeDetectorRef, Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDivider } from "@angular/material/divider";

export interface OrgNode { code: string; name: string; subs?: OrgNode[]; }

type DialogData = {
  tree: OrgNode[];
  selected: string[];
  includeChildren: boolean;
};

@Component({
  selector: 'app-place-tree-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatTreeModule, MatIconModule,
    MatCheckboxModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    
],
  templateUrl: './place-tree-dialog.component.html',
  styleUrls: ['./place-tree-dialog.component.scss']
})
export class PlaceTreeDialogComponent {

  // ✅ الشجرة الكلاسيكية
 dataSource = new MatTreeNestedDataSource<OrgNode>();   // نستخدمها كمخزن للشجرة فقط
  treeControl = new NestedTreeControl<OrgNode>(n => n.subs ?? []);
  selection = new SelectionModel<string>(true);
  // بديل للـ signals إن أردت البساطة
  includeChildren = true;
  filterText = '';
  expanded = new Set<string>();

  // خرائط مساعدة
  private descendantsMap = new Map<string, string[]>();
  private originalTree: OrgNode[] = [];
  private cdr = inject(ChangeDetectorRef);

  constructor(
    
    private ref: MatDialogRef<PlaceTreeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.originalTree = data.tree ?? [];
    this.dataSource.data = this.originalTree;
    this.includeChildren = !!data.includeChildren;

    // بناء خرائط الأحفاد لمرة واحدة
    this.buildDescendantsMap(this.originalTree);

    // تحميل المختار مسبقاً
    (data.selected ?? []).forEach(c => this.selection.select(c));

        (this.originalTree ?? []).forEach(r => r.code && this.expanded.add(r.code));

  }

  hasChild = (_: number, node: OrgNode) => !!node.subs && node.subs.length > 0;

  private buildDescendantsMap(nodes: OrgNode[]) {
    const gather = (n: OrgNode): string[] => {
      const kids = (n.subs ?? []).flatMap(gather);
      const all = (n.code ? [n.code] : []).concat(kids);
      if (n.code) this.descendantsMap.set(n.code, all);
      return all;
    };
    nodes.forEach(gather);
  }
expandAll()    { (this.dataSource.data ?? []).forEach(n => n.code && this.expanded.add(n.code)); }
  collapseAll()  { this.expanded.clear(); }
 

  // تصفية بالاسم مع الحفاظ على الآباء
  applyFilter(value: string) {
    this.filterText = (value ?? '').trim().toLowerCase();
    if (!this.filterText) {
      this.dataSource.data = this.originalTree;
      // this.treeControl.collapseAll();
      return;
    }
    const visit = (arr: OrgNode[]): OrgNode[] => {
      const out: OrgNode[] = [];
      for (const n of arr) {
        const subs = visit(n.subs ?? []);
        if (n.name.toLowerCase().includes(this.filterText) || subs.length) {
          out.push({ ...n, subs });
        }
      }
      return out;
    };
    this.dataSource.data = visit(this.originalTree);
    // this.treeControl.expandAll();
  }

  // حالة الصندوق: كامل/جزئي/لا شيء
  nodeChecked(node: OrgNode): 'checked' | 'indeterminate' | 'none' {
    const codes = this.descendantsMap.get(node.code) ?? (node.code ? [node.code] : []);
    const hits = codes.filter(c => this.selection.isSelected(c)).length;
    if (hits === 0) return 'none';
    if (hits === codes.length) return 'checked';
    return 'indeterminate';
  } 

  // تبديل اختيار عقدة (مع/بدون الفروع)
  toggle(node: OrgNode) {
    if (!node.code) return;
    const codes = this.includeChildren ? (this.descendantsMap.get(node.code) ?? [node.code]) : [node.code];
    const anySelected = codes.some(c => this.selection.isSelected(c));
    if (anySelected) {
      codes.forEach(c => this.selection.deselect(c));
    } else {
      codes.forEach(c => this.selection.select(c));
    }
  }
private getDescendantCodes(node: OrgNode): string[] {
  const acc: string[] = [];
  const walk = (n: OrgNode) => { if (n?.code) acc.push(n.code); (n?.subs ?? []).forEach(walk); };
  walk(node);
  return Array.from(new Set(acc));
}
    // اختيار/إلغاء تحديد (مع/بدون الفروع)
 toggleSelect(node: OrgNode, ev?: MouseEvent) {
  ev?.stopPropagation?.();
  if (!node?.code) return;

  const codes = this.getDescendantCodes(node);
  const allSelected = codes.length > 0 && codes.every(c => this.selection.isSelected(c));

  if (allSelected) codes.forEach(c => this.selection.deselect(c));
  else             codes.forEach(c => this.selection.select(c));

  this.cdr?.markForCheck?.();
}

   // توسعة/طي يدوي
  isExpanded(node: OrgNode) { return node.code ? this.expanded.has(node.code) : false; }
  toggleExpand(node: OrgNode) {
    if (!node.code) return;
    if (this.expanded.has(node.code)) this.expanded.delete(node.code);
    else this.expanded.add(node.code);
  }

  
  


  // أزرار سريعة
  expandBranch(node: OrgNode) {
    // يوسع بصرياً فقط
    this.treeControl.expand(node);
    (node.subs ?? []).forEach(child => this.expandBranch(child));
  }

  clearBranch(node: OrgNode) {
    (this.descendantsMap.get(node.code) ?? []).forEach(c => this.selection.deselect(c));
  }

  selectAllVisible() {
    const visit = (arr: OrgNode[]) => {
      for (const n of arr) {
        if (n.code) this.selection.select(n.code);
        visit(n.subs ?? []);
      }
    };
    visit(this.dataSource.data);
  }

  clearAll() {
    this.selection.clear();
  }

  // إغلاق
  done() {
    this.ref.close({ codes: this.selection.selected.slice(), includeChildren: this.includeChildren });
  }

  cancel() {
    this.ref.close();
  }
    trackByCode = (_: number, n: OrgNode) => n.code;

}
