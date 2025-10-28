import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Employee } from "./local-employees.service";

// employee-actions.service.ts
@Injectable({ providedIn: 'root' })
export class EmployeeActionsService {
  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {}

  browse(emp: Employee) {
    // this.router.navigate(['/employees', emp.id, 'view']);

        return this.router.navigate(['/employees/browse', emp.id]);

  }

  edit(emp: Employee) {
    // this.router.navigate(['/employees', emp.id, 'edit']);
        return this.router.navigate(['/employees/edit', emp.id]);

  }



openEmploymentChanges(emp: Employee) {
  this.router.navigate(
    ['/employees/edit', emp.id],
    { queryParams: { tab: 'changes' } }
  );
}


}
