// import { Component } from '@angular/core';
// import { MatCard } from "@angular/material/card";
// import { MatIcon } from "@angular/material/icon";
// @Component({
//   selector: 'app-admin',
//   imports: [MatCard, MatIcon],
//   templateUrl: './admin.component.html',
//   styleUrl: './admin.component.scss'
// })
// export class AdminComponent {
// back() {
// throw new Error('Method not implemented.');
// }

//  formatDate(v?: string | Date | null): string {
//     if (!v) return '—';
//     const d = v instanceof Date ? v : new Date(v);
//     if (isNaN(d.getTime())) return String(v);
//     const day = String(d.getDate()).padStart(2, '0');
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     const year = d.getFullYear();
//     return `${day}/${month}/${year}`;
//   }

//   today = () => new Date();

// }



import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCard, MatIcon, MatButton, MatCardModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  constructor(private location: Location) {}

  back() {
    this.location.back();
  }

  formatDate(v?: string | Date | null): string {
    if (!v) return '—';
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d.getTime())) return String(v);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  today = () => new Date();
}

