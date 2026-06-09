import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MascotaService } from '../../core/services/mascota.service';
import { CitaService } from '../../core/services/cita.service';
import { AuthService } from '../../core/services/auth.service';
import { FechaCitaPipe, EstadoBadgePipe } from '../../shared/pipes/custom-pipes';
import { ResaltarProximaCitaDirective } from '../../shared/directives/custom-directives';
import { Observable, combineLatest, map } from 'rxjs';
import { Cita, EstadoCita } from '../../core/models/cita.model';
import { Mascota } from '../../core/models/mascota.model';
import { DuenoMascota } from '../../core/models/usuario.model';

interface ResumenVet {
  totalMascotas: number;
  citasHoy: number;
  citasPendientes: number;
  mascotasEnTratamiento: number;
}

interface ResumenDueno {
  misMascotas: number;
  citasPendientes: number;
  citasCompletadas: number;
  mascotaEnTratamiento: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FechaCitaPipe, EstadoBadgePipe, ResaltarProximaCitaDirective],
  template: `
    <!-- ============================================================
         DASHBOARD VETERINARIO
    ============================================================ -->
    <div class="container-fluid py-4 px-4" *ngIf="esVeterinario">

      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 page-title mb-0">Bienvenido, {{ nombreUsuario }}</h1>
          <p class="mb-0 small" style="color:var(--vc-text-muted)">
            {{ hoy | date:'EEEE, d MMMM yyyy':'':'es' }}
          </p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/citas/nueva" class="btn btn-primary btn-sm">
            <i class="bi bi-calendar-plus me-1"></i>Nueva Cita
          </a>
          <a routerLink="/mascotas/nueva" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-plus me-1"></i>Nueva Mascota
          </a>
        </div>
      </div>

      <!-- Tarjetas resumen vet -->
      <div class="row g-3 mb-4" *ngIf="resumenVet$ | async as res">
        <div class="col-6 col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center gap-3">
                <div class="stat-icon" style="background-color:var(--vc-primary-lt)">
                  <i class="bi bi-paw" style="color:var(--vc-primary)"></i>
                </div>
                <div>
                  <div class="h4 mb-0 fw-bold">{{ res.totalMascotas }}</div>
                  <div class="small" style="color:var(--vc-text-muted)">Total Mascotas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center gap-3">
                <div class="stat-icon" style="background-color:#eaf5ec">
                  <i class="bi bi-calendar-check" style="color:var(--vc-success)"></i>
                </div>
                <div>
                  <div class="h4 mb-0 fw-bold">{{ res.citasHoy }}</div>
                  <div class="small" style="color:var(--vc-text-muted)">Citas Hoy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center gap-3">
                <div class="stat-icon" style="background-color:#fdf8ec">
                  <i class="bi bi-hourglass-split" style="color:#9a7c30"></i>
                </div>
                <div>
                  <div class="h4 mb-0 fw-bold">{{ res.citasPendientes }}</div>
                  <div class="small" style="color:var(--vc-text-muted)">Pendientes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center gap-3">
                <div class="stat-icon" style="background-color:#fbeded">
                  <i class="bi bi-capsule" style="color:#8b3a3a"></i>
                </div>
                <div>
                  <div class="h4 mb-0 fw-bold">{{ res.mascotasEnTratamiento }}</div>
                  <div class="small" style="color:var(--vc-text-muted)">En Tratamiento</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Próximas citas -->
        <div class="col-md-7">
          <div class="card">
            <div class="card-header bg-white py-3">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-calendar3 me-2" style="color:var(--vc-primary)"></i>Próximas Citas
                </h5>
                <a routerLink="/citas" class="btn btn-outline-primary btn-sm">Ver todas</a>
              </div>
            </div>
            <div class="card-body pt-2">
              <ng-container *ngIf="proximasCitas$ | async as citas">
                <div *ngIf="citas.length === 0" class="text-center py-4" style="color:var(--vc-text-muted)">
                  <i class="bi bi-inbox" style="font-size:2rem"></i>
                  <p class="mt-2 mb-0 small">No hay citas próximas</p>
                </div>
                <div *ngFor="let cita of citas" class="card mb-2" [appResaltarProxima]="cita">
                  <div class="card-body py-2 px-3">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <div class="fw-bold small">{{ cita.tipoConsulta }}</div>
                        <div class="small" style="color:var(--vc-text-muted)">
                          {{ cita.fecha | fechaCita:'relativo' }} · {{ cita.hora }}
                        </div>
                        <div style="font-size:0.78rem;color:var(--vc-text-muted)">
                          {{ cita.motivoConsulta }}
                        </div>
                      </div>
                      <span class="badge {{ cita.estado | estadoBadge }}">{{ cita.estado }}</span>
                    </div>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>
        </div>

        <!-- Accesos rápidos vet -->
        <div class="col-md-5">
          <div class="card h-100">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0">
                <i class="bi bi-grid me-2" style="color:var(--vc-accent)"></i>Accesos Rápidos
              </h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <a routerLink="/mascotas/nueva" class="btn btn-outline-primary text-start">
                  <i class="bi bi-plus-circle me-2"></i>Registrar nueva mascota
                </a>
                <a routerLink="/citas/nueva" class="btn btn-outline-success text-start">
                  <i class="bi bi-calendar-plus me-2"></i>Agendar cita
                </a>
                <a routerLink="/mascotas" class="btn btn-outline-secondary text-start">
                  <i class="bi bi-search me-2"></i>Buscar mascota
                </a>
                <a routerLink="/historial" class="btn btn-outline-secondary text-start">
                  <i class="bi bi-clock-history me-2"></i>Ver historial
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         DASHBOARD DUEÑO  —  diseño propio, más personal
    ============================================================ -->
    <div class="container-fluid py-4 px-4" *ngIf="!esVeterinario">

      <!-- Saludo personalizado con banner -->
      <div class="dueno-banner card mb-4">
        <div class="card-body py-4 px-4">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <p class="small mb-1" style="color:var(--vc-primary);font-weight:700;
                 text-transform:uppercase;letter-spacing:0.5px">
                <i class="bi bi-heart me-1"></i>Tu espacio en VetCare
              </p>
              <h1 class="h3 page-title mb-1">Hola, {{ nombreUsuario }}</h1>
              <p class="mb-0 small" style="color:var(--vc-text-muted)">
                {{ hoy | date:'EEEE, d MMMM yyyy':'':'es' }}
              </p>
            </div>
            <a routerLink="/citas/nueva" class="btn btn-primary">
              <i class="bi bi-calendar-plus me-2"></i>Solicitar una cita
            </a>
          </div>
        </div>
      </div>

      <!-- Tarjetas dueño -->
      <div class="row g-3 mb-4" *ngIf="resumenDueno$ | async as res">
        <div class="col-6 col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center gap-3">
                <div class="stat-icon" style="background-color:var(--vc-primary-lt)">
                  <i class="bi bi-paw" style="color:var(--vc-primary)"></i>
                </div>
                <div>
                  <div class="h4 mb-0 fw-bold">{{ res.misMascotas }}</div>
                  <div class="small" style="color:var(--vc-text-muted)">Mis Mascotas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center gap-3">
                <div class="stat-icon" style="background-color:#fdf8ec">
                  <i class="bi bi-hourglass-split" style="color:#9a7c30"></i>
                </div>
                <div>
                  <div class="h4 mb-0 fw-bold">{{ res.citasPendientes }}</div>
                  <div class="small" style="color:var(--vc-text-muted)">Citas Activas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center gap-3">
                <div class="stat-icon" style="background-color:#eaf5ec">
                  <i class="bi bi-clipboard-check" style="color:var(--vc-success)"></i>
                </div>
                <div>
                  <div class="h4 mb-0 fw-bold">{{ res.citasCompletadas }}</div>
                  <div class="small" style="color:var(--vc-text-muted)">Consultas Realizadas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerta si hay mascota en tratamiento -->
      <div class="alert mb-4" *ngIf="(resumenDueno$ | async)?.mascotaEnTratamiento"
           style="background-color:#fdf8ec;border:1px solid var(--vc-warning);
                  border-radius:10px;color:#7a6020">
        <i class="bi bi-exclamation-circle me-2"></i>
        Una de tus mascotas está en tratamiento activo. Revisa el historial para más detalles.
      </div>

      <div class="row g-4">
        <!-- Mis mascotas (vista compacta) -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-white py-3">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-paw me-2" style="color:var(--vc-primary)"></i>Mis Mascotas
                </h5>
                <a routerLink="/mascotas" class="btn btn-outline-primary btn-sm">Ver todas</a>
              </div>
            </div>
            <div class="card-body pt-2">
              <div *ngIf="misMascotas.length === 0"
                   class="text-center py-4" style="color:var(--vc-text-muted)">
                <i class="bi bi-paw" style="font-size:2rem;opacity:0.3"></i>
                <p class="mt-2 mb-2 small">Aún no tienes mascotas registradas.</p>
                <a routerLink="/mascotas/nueva" class="btn btn-primary btn-sm">
                  <i class="bi bi-plus me-1"></i>Agregar mascota
                </a>
              </div>
              <div *ngFor="let m of misMascotas" class="dueno-mascota-row">
                <div class="dueno-mascota-icon">
                  <i class="bi bi-paw" style="color:var(--vc-primary)"></i>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-bold small" style="font-family:'Playfair Display',serif">
                    {{ m.nombre }}
                  </div>
                  <div style="font-size:0.78rem;color:var(--vc-text-muted)">
                    {{ m.especie }} · {{ m.raza }}
                  </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <span class="badge"
                        [style.background-color]="m.estadoSalud === 'Saludable' ? '#eaf5ec' : '#fdf8ec'"
                        [style.color]="m.estadoSalud === 'Saludable' ? 'var(--vc-success)' : '#9a7c30'"
                        style="font-size:0.7rem">
                    {{ m.estadoSalud }}
                  </span>
                  <a [routerLink]="['/mascotas', m.id]"
                     class="btn btn-outline-primary btn-sm py-0 px-2">
                    <i class="bi bi-eye"></i>
                  </a>
                </div>
              </div>
            </div>
            <div class="card-footer bg-white border-0">
              <a routerLink="/mascotas/nueva" class="btn btn-outline-primary btn-sm w-100">
                <i class="bi bi-plus me-1"></i>Agregar nueva mascota
              </a>
            </div>
          </div>
        </div>

        <!-- Mis citas recientes -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-white py-3">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-calendar3 me-2" style="color:var(--vc-primary)"></i>Mis Citas
                </h5>
                <a routerLink="/citas" class="btn btn-outline-primary btn-sm">Ver todas</a>
              </div>
            </div>
            <div class="card-body pt-2">
              <ng-container *ngIf="misCitas$ | async as citas">
                <div *ngIf="citas.length === 0"
                     class="text-center py-4" style="color:var(--vc-text-muted)">
                  <i class="bi bi-calendar-x" style="font-size:2rem;opacity:0.3"></i>
                  <p class="mt-2 mb-2 small">No tienes citas agendadas.</p>
                  <a routerLink="/citas/nueva" class="btn btn-primary btn-sm">
                    <i class="bi bi-plus me-1"></i>Solicitar cita
                  </a>
                </div>
                <div *ngFor="let cita of citas" class="card mb-2" [appResaltarProxima]="cita">
                  <div class="card-body py-2 px-3">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <div class="fw-bold small">{{ cita.tipoConsulta }}</div>
                        <div class="small" style="color:var(--vc-text-muted)">
                          {{ cita.fecha | fechaCita:'relativo' }} · {{ cita.hora }}
                        </div>
                      </div>
                      <span class="badge {{ cita.estado | estadoBadge }}">
                        {{ cita.estado }}
                      </span>
                    </div>
                  </div>
                </div>
              </ng-container>
            </div>
            <div class="card-footer bg-white border-0">
              <a routerLink="/citas/nueva" class="btn btn-primary btn-sm w-100">
                <i class="bi bi-calendar-plus me-1"></i>Solicitar nueva cita
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-icon {
      width: 44px; height: 44px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    /* Banner dueño */
    .dueno-banner {
      background: linear-gradient(120deg, var(--vc-primary-lt) 60%, var(--vc-accent-lt) 100%);
      border: 1px solid var(--vc-border);
    }

    /* Fila de mascota en el panel de dueño */
    .dueno-mascota-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.6rem 0;
      border-bottom: 1px solid var(--vc-border);
    }
    .dueno-mascota-row:last-child { border-bottom: none; }

    .dueno-mascota-icon {
      width: 34px; height: 34px;
      border-radius: 50%;
      background-color: var(--vc-primary-lt);
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }
  `]
})
export class DashboardComponent implements OnInit {
  hoy = new Date();
  nombreUsuario = '';
  esVeterinario = false;
  idDueno = '';

  resumenVet$!: Observable<ResumenVet>;
  resumenDueno$!: Observable<ResumenDueno>;
  proximasCitas$!: Observable<Cita[]>;
  misCitas$!: Observable<Cita[]>;
  misMascotas: Mascota[] = [];

  constructor(
    private mascotaService: MascotaService,
    private citaService: CitaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.usuarioActual;
    this.nombreUsuario = usuario?.nombre ?? 'Usuario';
    this.esVeterinario = this.authService.esVeterinario();

    if (this.esVeterinario) {
      // ---- Dashboard veterinario ----
      this.resumenVet$ = combineLatest([
        this.mascotaService.mascotas$,
        this.citaService.citas$
      ]).pipe(
        map(([mascotas, citas]) => ({
          totalMascotas: mascotas.length,
          citasHoy: citas.filter(c =>
            new Date(c.fecha).toDateString() === new Date().toDateString()).length,
          citasPendientes: citas.filter(c =>
            c.estado === EstadoCita.PENDIENTE || c.estado === EstadoCita.CONFIRMADA).length,
          mascotasEnTratamiento: mascotas.filter(m => m.estaEnTratamiento()).length
        }))
      );

      this.proximasCitas$ = this.citaService.citas$.pipe(
        map(citas => citas
          .filter(c => c.estado !== EstadoCita.CANCELADA && c.estado !== EstadoCita.COMPLETADA)
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
          .slice(0, 5)
        )
      );
    } else {
      // ---- Dashboard dueño ----
      if (usuario instanceof DuenoMascota) {
        this.idDueno = usuario.id;
      }

      // Solo las mascotas de este dueño
      this.mascotaService.mascotas$.subscribe(mascotas => {
        this.misMascotas = mascotas.filter(m => m.idDueno === this.idDueno);
      });

      this.resumenDueno$ = combineLatest([
        this.mascotaService.mascotas$,
        this.citaService.citas$
      ]).pipe(
        map(([mascotas, citas]) => {
          const misMasc = mascotas.filter(m => m.idDueno === this.idDueno);
          const misCitas = citas.filter(c => c.idDueno === this.idDueno);
          return {
            misMascotas: misMasc.length,
            citasPendientes: misCitas.filter(c =>
              c.estado === EstadoCita.PENDIENTE ||
              c.estado === EstadoCita.CONFIRMADA ||
              c.estado === EstadoCita.EN_CURSO).length,
            citasCompletadas: misCitas.filter(c =>
              c.estado === EstadoCita.COMPLETADA).length,
            mascotaEnTratamiento: misMasc.some(m => m.estaEnTratamiento())
          };
        })
      );

      this.misCitas$ = this.citaService.citas$.pipe(
        map(citas => citas
          .filter(c => c.idDueno === this.idDueno)
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
          .slice(0, 5)
        )
      );
    }
  }
}
