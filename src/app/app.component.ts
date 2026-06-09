import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar navbar-expand-lg" *ngIf="estaAutenticado$ | async">
      <div class="container-fluid px-4">
        <a class="navbar-brand" routerLink="/dashboard">
          <i class="bi bi-heart-pulse me-2"></i>VetCare
        </a>
        <button class="navbar-toggler border-0" type="button"
                data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto gap-1">
            <li class="nav-item">
              <a class="nav-link" routerLink="/mascotas" routerLinkActive="active">
                <i class="bi bi-paw me-1"></i>Mascotas
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/citas" routerLinkActive="active">
                <i class="bi bi-calendar3 me-1"></i>Citas
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/historial" routerLinkActive="active">
                <i class="bi bi-clock-history me-1"></i>Historial
              </a>
            </li>
          </ul>
          <div class="d-flex align-items-center gap-3">
            <!-- Badge de rol -->
            <span class="badge"
                  [style.background-color]="esVeterinario() ? 'var(--vc-primary-lt)' : 'var(--vc-accent-lt)'"
                  [style.color]="esVeterinario() ? 'var(--vc-primary-dk)' : 'var(--vc-accent)'"
                  style="font-size:0.72rem;padding:0.3em 0.7em;border-radius:20px;">
              {{ esVeterinario() ? 'Veterinario' : 'Dueño' }}
            </span>
            <span style="font-size:0.85rem; color:var(--vc-text-muted)">
              <i class="bi bi-person-circle me-1"></i>
              {{ (usuarioActual$ | async)?.nombre }}
            </span>
            <button class="btn btn-navbar-exit btn-sm" (click)="cerrarSesion()">
              <i class="bi bi-box-arrow-right me-1"></i>Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
    <main>
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {
  estaAutenticado$: Observable<boolean>;
  usuarioActual$;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.estaAutenticado$ = this.authService.estaAutenticado$;
    this.usuarioActual$ = this.authService.usuarioActual$;
  }

  esVeterinario(): boolean {
    return this.authService.esVeterinario();
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
