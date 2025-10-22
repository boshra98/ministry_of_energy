// import { Routes } from '@angular/router';

// export const routes: Routes = [];
// import { Routes } from '@angular/router';
// import { HomeComponent } from './pages/home/home.component';

// export const routes: Routes = [
//   { path: '', component: HomeComponent },
//   { path: '**', redirectTo: '' }
  
// ];

import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'الصفحة الرئيسية' },

  {
    path: 'employees/new',
    loadComponent: () =>
      import('./pages/employees/add-employee/add-employee.component')
        .then(m => m.AddEmployeeComponent),
    title: 'إضافة موظف'
  },
  {
    path: 'employees',
    loadComponent: () =>
      import('./pages/employees/list-employees/list-employees.component')
        .then(m => m.ListEmployeesComponent),
    title: 'استعراض الموظفين'
  },

    
   {
    path: 'employees/edit/:id',
    loadComponent: () =>
      import('./pages/employees/edit-employee/edit-employee.component')
        .then(m => m.EditEmployeeComponent),
    title: 'تعديل بيانات الموظفين'
  },

  {
    path: 'employees/browse/:id',
    loadComponent: () =>
      import('./pages/employees/browse-employee/browse-employee.component')
        .then(m => m.BrowseEmployeeComponent),
    title: '  عرض تفاصيل الموظف'
  },


  {
    path: 'search',
    loadComponent: () =>
      import('./pages/search/search/search.component')
        .then(m => m.SearchComponent),
    title: 'بحث'
  },
  {
    path: 'stats',
    loadComponent: () =>
      import('./pages/stats/stats/stats.component')
        .then(m => m.StatsComponent),
    title: 'بيانات إحصائية'
  },
  {
    path: 'archive',
    loadComponent: () =>
      import('./pages/archive/archive/archive.component')
        .then(m => m.ArchiveComponent),
    title: 'الأرشيف'
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin/admin.component')
        .then(m => m.AdminComponent),
    title: 'لوحة التحكم'
  },

  {
  path: 'settings/lookups',
  loadComponent: () =>
    import('./pages/settings/lookups-settings.page/lookups-settings.page.component')
      .then(m => m.LookupsSettingsPage),
  title: 'إعدادات القوائم',
},

{
  path: 'employees/:id/documents',
  loadComponent: () =>
    import('./pages/employees/employee-documents/employee-documents.component')
      .then(m => m.EmployeeDocumentsComponent), // standalone
  title: 'مرفقات الموظف'
},



  { path: '**', redirectTo: '' }
];
