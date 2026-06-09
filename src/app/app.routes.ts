import { Routes } from '@angular/router';

// Lazy loading: cada módulo se carga solo cuando el usuario lo necesita
// Esto mejora el tiempo de carga inicial de la app
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/components/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'mascotas',
    loadComponent: () => import('./modules/mascotas/components/lista-mascotas.component').then(m => m.ListaMascotasComponent)
  },
  {
    path: 'mascotas/nueva',
    loadComponent: () => import('./modules/mascotas/components/form-mascota.component').then(m => m.FormMascotaComponent)
  },
  {
    path: 'mascotas/:id',
    loadComponent: () => import('./modules/mascotas/components/detalle-mascota.component').then(m => m.DetalleMascotaComponent)
  },
  {
    path: 'citas',
    loadComponent: () => import('./modules/citas/components/agenda-citas.component').then(m => m.AgendaCitasComponent)
  },
  {
    path: 'citas/nueva',
    loadComponent: () => import('./modules/citas/components/form-cita.component').then(m => m.FormCitaComponent)
  },
  {
    path: 'historial',
    loadComponent: () => import('./modules/historial/components/historial.component').then(m => m.HistorialComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
