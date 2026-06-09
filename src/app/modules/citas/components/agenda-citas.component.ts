import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CitaService } from '../../../core/services/cita.service';
import { MascotaService } from '../../../core/services/mascota.service';
import { VeterinarioService, AuthService } from '../../../core/services/auth.service';
import { Cita, EstadoCita } from '../../../core/models/cita.model';
import { FechaCitaPipe, EstadoBadgePipe } from '../../../shared/pipes/custom-pipes';
import { ResaltarProximaCitaDirective } from '../../../shared/directives/custom-directives';
import { Observable, map } from 'rxjs';
import { DuenoMascota } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-agenda-citas',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule,
            FechaCitaPipe, EstadoBadgePipe, ResaltarProximaCitaDirective],
  template: `
    <div class="container-fluid py-4 px-4">

      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 page-title mb-0">
            {{ esVeterinario ? 'Agenda de Citas' : 'Mis Citas' }}
          </h2>
          <p class="small mb-0" style="color:var(--vc-text-muted)">
            {{ esVeterinario
               ? 'Gestiona y actualiza el estado de cada cita'
               : 'Consulta tus citas agendadas' }}
          </p>
        </div>
        <a routerLink="/citas/nueva" class="btn btn-primary btn-sm">
          <i class="bi bi-calendar-plus me-1"></i>Solicitar Cita
        </a>
      </div>

      <!-- Filtros por estado — solo para veterinarios -->
      <div class="card mb-4" *ngIf="esVeterinario">
        <div class="card-body py-3">
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <span class="small fw-bold me-1" style="color:var(--vc-text-muted)">
              Estado:
            </span>
            <button *ngFor="let estado of estadosFiltro"
                    class="btn btn-sm"
                    [class]="filtroActivo === estado ? 'btn-primary' : 'btn-outline-secondary'"
                    (click)="cambiarFiltro(estado)">
              {{ estado === 'TODOS' ? 'Todos' : estado }}
              <span class="badge ms-1"
                    style="background:rgba(0,0,0,0.08);color:inherit">
                {{ contarPorEstado(estado) }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de citas -->
      <ng-container *ngIf="citasFiltradas$ | async as citas">

        <div *ngIf="citas.length === 0" class="text-center py-5">
          <i class="bi bi-calendar-x"
             style="font-size:3rem;color:var(--vc-border)"></i>
          <h5 class="mt-3" style="color:var(--vc-text-muted)">
            {{ esVeterinario ? 'No hay citas con este filtro' : 'No tienes citas agendadas' }}
          </h5>
          <a routerLink="/citas/nueva" class="btn btn-primary btn-sm mt-2">
            <i class="bi bi-plus me-1"></i>Solicitar cita
          </a>
        </div>

        <div class="row g-3">
          <div *ngFor="let cita of citas" class="col-md-6 col-xl-4">
            <div class="card h-100" [appResaltarProxima]="cita">
              <div class="card-body">

                <!-- Cabecera -->
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span class="badge {{ cita.estado | estadoBadge }} mb-1">
                      {{ cita.estado }}
                    </span>
                    <h6 class="fw-bold mb-0" style="font-family:'Playfair Display',serif">
                      {{ cita.tipoConsulta }}
                    </h6>
                  </div>
                  <div class="text-end" style="color:var(--vc-text-muted);font-size:0.82rem">
                    <div>
                      <i class="bi bi-calendar3 me-1"></i>
                      {{ cita.fecha | fechaCita:'relativo' }}
                    </div>
                    <div class="fw-bold" style="color:var(--vc-text)">{{ cita.hora }}</div>
                  </div>
                </div>

                <!-- Detalle -->
                <div class="small mb-3" style="color:var(--vc-text-muted)">
                  <div class="mb-1">
                    <i class="bi bi-paw me-1" style="color:var(--vc-primary)"></i>
                    <strong>Mascota:</strong> {{ getNombreMascota(cita.idMascota) }}
                  </div>
                  <div class="mb-1" *ngIf="esVeterinario">
                    <i class="bi bi-person-badge me-1" style="color:var(--vc-success)"></i>
                    <strong>Veterinario:</strong> {{ getNombreVet(cita.idVeterinario) }}
                  </div>
                  <div>
                    <i class="bi bi-chat-text me-1"></i>{{ cita.motivoConsulta }}
                  </div>
                </div>

                <!-- Alerta próxima cita -->
                <div *ngIf="cita.esProxima()"
                     class="alert alert-warning py-1 px-2 mb-3 small">
                  <i class="bi bi-alarm me-1"></i>Cita en menos de 24 horas
                </div>

                <!-- Acciones — SOLO veterinarios -->
                <div class="d-flex flex-wrap gap-1" *ngIf="esVeterinario">
                  <button *ngIf="cita.estado === 'Pendiente'"
                          class="btn btn-sm btn-info text-white"
                          (click)="cambiarEstado(cita, estadoCita.CONFIRMADA)">
                    <i class="bi bi-check me-1"></i>Confirmar
                  </button>
                  <button *ngIf="cita.estado === 'Confirmada'"
                          class="btn btn-sm btn-primary"
                          (click)="cambiarEstado(cita, estadoCita.EN_CURSO)">
                    <i class="bi bi-play me-1"></i>Iniciar
                  </button>
                  <button *ngIf="cita.estado === 'En curso'"
                          class="btn btn-sm btn-success"
                          (click)="cambiarEstado(cita, estadoCita.COMPLETADA)">
                    <i class="bi bi-check-all me-1"></i>Completar
                  </button>
                  <button *ngIf="cita.estado !== 'Completada' && cita.estado !== 'Cancelada'"
                          class="btn btn-sm btn-outline-danger"
                          (click)="cambiarEstado(cita, estadoCita.CANCELADA)">
                    <i class="bi bi-x me-1"></i>Cancelar
                  </button>
                </div>

                <!-- Para dueños: solo info de estado, sin botones de acción -->
                <div *ngIf="!esVeterinario"
                     class="small p-2 rounded"
                     style="background-color:var(--vc-bg);border:1px solid var(--vc-border)">
                  <i class="bi bi-info-circle me-1" style="color:var(--vc-primary)"></i>
                  {{ getMensajeEstadoDueno(cita.estado) }}
                </div>

              </div>
            </div>
          </div>
        </div>

      </ng-container>
    </div>
  `,
  styles: [`
    :host ::ng-deep .proxima-cita-highlight {
      animation: pulse-border 2.5s infinite;
    }
  `]
})
export class AgendaCitasComponent implements OnInit {
  estadoCita = EstadoCita;
  estadosFiltro = ['TODOS', ...Object.values(EstadoCita)];
  filtroActivo = 'TODOS';
  todasLasCitas: Cita[] = [];
  citasFiltradas$!: Observable<Cita[]>;
  esVeterinario = false;
  idDuenoActual = '';

  constructor(
    private citaService: CitaService,
    private mascotaService: MascotaService,
    private vetService: VeterinarioService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.esVeterinario = this.authService.esVeterinario();

    // Si es dueño, guardamos su ID para filtrar solo sus citas
    const usuario = this.authService.usuarioActual;
    if (usuario instanceof DuenoMascota) {
      this.idDuenoActual = usuario.id;
    }

    this.citaService.citas$.subscribe(c => this.todasLasCitas = c);
    this.actualizarFiltro();
  }

  actualizarFiltro(): void {
    this.citasFiltradas$ = this.citaService.citas$.pipe(
      map(citas => {
        let resultado = citas;

        // Dueños solo ven sus propias citas
        if (!this.esVeterinario && this.idDuenoActual) {
          resultado = resultado.filter(c => c.idDueno === this.idDuenoActual);
        }

        // Filtro por estado (solo veterinarios usan este filtro)
        if (this.filtroActivo !== 'TODOS') {
          resultado = resultado.filter(c => c.estado === this.filtroActivo);
        }

        return resultado.sort(
          (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );
      })
    );
  }

  cambiarFiltro(estado: string): void {
    this.filtroActivo = estado;
    this.actualizarFiltro();
  }

  contarPorEstado(estado: string): number {
    if (estado === 'TODOS') return this.todasLasCitas.length;
    return this.todasLasCitas.filter(c => c.estado === estado).length;
  }

  cambiarEstado(cita: Cita, estado: EstadoCita): void {
    // Doble verificación: solo veterinarios pueden cambiar estado
    if (!this.esVeterinario) return;
    this.citaService.cambiarEstado(cita.id, estado);
  }

  getNombreMascota(id: string): string {
    return this.mascotaService.obtenerPorId(id)?.nombre ?? 'Desconocida';
  }

  getNombreVet(id: string): string {
    return this.vetService.obtenerPorId(id)?.nombre ?? 'Sin asignar';
  }

  // Mensaje amigable para dueños según el estado de su cita
  getMensajeEstadoDueno(estado: EstadoCita): string {
    const mensajes: Record<EstadoCita, string> = {
      [EstadoCita.PENDIENTE]:   'Tu solicitud está en revisión.',
      [EstadoCita.CONFIRMADA]:  'La clínica ha confirmado tu cita.',
      [EstadoCita.EN_CURSO]:    'Tu mascota está siendo atendida.',
      [EstadoCita.COMPLETADA]:  'Consulta finalizada. Revisa el historial.',
      [EstadoCita.CANCELADA]:   'Esta cita fue cancelada.'
    };
    return mensajes[estado] ?? '';
  }
}
