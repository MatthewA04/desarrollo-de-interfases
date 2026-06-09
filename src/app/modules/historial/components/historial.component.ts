import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { CitaService } from '../../../core/services/cita.service';
import { MascotaService } from '../../../core/services/mascota.service';
import { AuthService } from '../../../core/services/auth.service';
import { DuenoMascota } from '../../../core/models/usuario.model';
import { FechaCitaPipe } from '../../../shared/pipes/custom-pipes';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { IRegistroAtencion } from '../../../core/models/cita.model';
import { Mascota } from '../../../core/models/mascota.model';

interface RegistroConMascota extends IRegistroAtencion {
  mascota?: Mascota;
}

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FechaCitaPipe],
  template: `
    <div class="container-fluid py-4 px-4">

      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 page-title mb-0">Historial Clínico</h2>
          <p class="small mb-0" style="color:var(--vc-text-muted)">
            Registro completo de atenciones médicas
          </p>
        </div>
      </div>

      <!-- Filtro -->
      <div class="card mb-4">
        <div class="card-body py-3">
          <div class="row g-2 align-items-center">
            <div class="col-md-4">
              <div class="input-group input-group-sm">
                <span class="input-group-text">
                  <i class="bi bi-paw"></i>
                </span>
                <select class="form-select form-select-sm"
                        [formControl]="filtroMascota">
                  <option value="">Todas las mascotas</option>
                  <option *ngFor="let m of mascotas" [value]="m.id">
                    {{ m.nombre }} ({{ m.especie }})
                  </option>
                </select>
              </div>
            </div>
            <div class="col-auto">
              <button class="btn btn-outline-secondary btn-sm"
                      (click)="filtroMascota.setValue('')">
                <i class="bi bi-x me-1"></i>Limpiar
              </button>
            </div>
            <div class="col-auto ms-auto">
              <span class="badge"
                    style="background-color:var(--vc-primary-lt);
                           color:var(--vc-primary-dk);font-size:0.75rem;
                           padding:0.4em 0.9em">
                <i class="bi bi-journal-medical me-1"></i>
                {{ totalRegistros }} registro(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido -->
      <ng-container *ngIf="registros$ | async as registros">

        <!-- Vacío -->
        <div *ngIf="registros.length === 0" class="text-center py-5">
          <i class="bi bi-journal-x"
             style="font-size:2.5rem;color:var(--vc-border)"></i>
          <p class="mt-3 mb-0 fw-bold" style="color:var(--vc-text)">
            Sin registros
          </p>
          <p class="small" style="color:var(--vc-text-muted)">
            No se encontraron atenciones con ese filtro.
          </p>
        </div>

        <!-- Timeline de registros -->
        <div class="hist-timeline">
          <div *ngFor="let reg of registros; let last = last"
               class="hist-tl-item">

            <!-- Columna de fecha -->
            <div class="hist-tl-date-col">
              <div class="hist-tl-date-box">
                <span class="hist-tl-day">
                  {{ reg.fechaAtencion | date:'d' }}
                </span>
                <span class="hist-tl-month">
                  {{ reg.fechaAtencion | date:'MMM' | uppercase }}
                </span>
                <span class="hist-tl-year">
                  {{ reg.fechaAtencion | date:'yyyy' }}
                </span>
              </div>
              <div class="hist-tl-line" *ngIf="!last"></div>
            </div>

            <!-- Tarjeta del registro -->
            <div class="hist-tl-card card mb-4">
              <div class="card-body p-0">

                <!-- Cabecera con mascota -->
                <div class="hist-card-header"
                     *ngIf="reg.mascota">
                  <div class="d-flex align-items-center gap-2">
                    <div class="hist-species-dot">
                      <i class="{{ getIconoEspecie(reg.mascota.especie) }}"></i>
                    </div>
                    <div>
                      <span class="hist-mascota-name">
                        {{ reg.mascota.nombre }}
                      </span>
                      <span class="hist-mascota-meta">
                        {{ reg.mascota.especie }} · {{ reg.mascota.raza }}
                      </span>
                    </div>
                  </div>
                  <a [routerLink]="['/mascotas', reg.idMascota]"
                     class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-arrow-right"></i>
                  </a>
                </div>

                <!-- Cuerpo -->
                <div class="p-4">

                  <!-- Diagnóstico y tratamiento -->
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <div class="hist-section">
                        <div class="hist-section-label">
                          <i class="bi bi-search-heart me-1"></i>Diagnóstico
                        </div>
                        <p class="mb-0 small" style="color:var(--vc-text)">
                          {{ reg.diagnostico }}
                        </p>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="hist-section">
                        <div class="hist-section-label">
                          <i class="bi bi-heart-pulse me-1"></i>Tratamiento
                        </div>
                        <p class="mb-0 small" style="color:var(--vc-text)">
                          {{ reg.tratamiento }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Medicamentos -->
                  <div *ngIf="reg.medicamentos?.length" class="mb-3">
                    <div class="hist-section-label mb-2">
                      <i class="bi bi-capsule me-1"></i>Medicamentos
                    </div>
                    <div class="table-responsive">
                      <table class="table table-sm hist-med-table mb-0">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Dosis</th>
                            <th>Frecuencia</th>
                            <th>Duración</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr *ngFor="let med of reg.medicamentos">
                            <td class="fw-bold small">{{ med.nombre }}</td>
                            <td class="small">{{ med.dosis }}</td>
                            <td class="small">{{ med.frecuencia }}</td>
                            <td class="small">{{ med.duracionDias }}d</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Meta: peso + próxima visita -->
                  <div class="d-flex flex-wrap gap-3">
                    <div class="hist-meta-chip">
                      <i class="bi bi-speedometer2 me-1"
                         style="color:var(--vc-primary)"></i>
                      Peso: <strong>{{ reg.pesoEnConsulta }} kg</strong>
                    </div>
                    <div *ngIf="reg.proximaVisita" class="hist-meta-chip">
                      <i class="bi bi-calendar-check me-1"
                         style="color:var(--vc-success)"></i>
                      Próxima visita:
                      <strong>{{ reg.proximaVisita | fechaCita }}</strong>
                    </div>
                  </div>

                  <!-- Observaciones -->
                  <p *ngIf="reg.observaciones"
                     class="mb-0 mt-3 small"
                     style="color:var(--vc-text-muted);font-style:italic;
                            padding-top:0.75rem;
                            border-top:1px solid var(--vc-border)">
                    <i class="bi bi-chat-quote me-1"></i>
                    {{ reg.observaciones }}
                  </p>

                </div>
              </div>
            </div>

          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    /* Timeline */
    .hist-timeline {
      display: flex;
      flex-direction: column;
    }

    .hist-tl-item {
      display: flex;
      gap: 20px;
      align-items: flex-start;
    }

    /* Columna de fecha */
    .hist-tl-date-col {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 56px;
    }

    .hist-tl-date-box {
      width: 52px;
      background-color: var(--vc-primary-lt);
      border: 1px solid var(--vc-border);
      border-radius: 10px;
      text-align: center;
      padding: 0.4rem 0.3rem;
      margin-top: 4px;
    }

    .hist-tl-day {
      display: block;
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--vc-primary);
      line-height: 1;
    }

    .hist-tl-month {
      display: block;
      font-size: 0.62rem;
      font-weight: 700;
      color: var(--vc-primary-dk);
      letter-spacing: 0.5px;
    }

    .hist-tl-year {
      display: block;
      font-size: 0.62rem;
      color: var(--vc-text-muted);
    }

    .hist-tl-line {
      width: 2px;
      flex: 1;
      min-height: 24px;
      background-color: var(--vc-border);
      margin-top: 4px;
    }

    /* Tarjeta */
    .hist-tl-card {
      flex: 1;
    }

    .hist-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.25rem;
      background-color: var(--vc-bg);
      border-bottom: 1px solid var(--vc-border);
      border-radius: 12px 12px 0 0;
    }

    .hist-species-dot {
      width: 34px; height: 34px;
      border-radius: 50%;
      background-color: var(--vc-primary-lt);
      display: flex; align-items: center; justify-content: center;
      color: var(--vc-primary);
      font-size: 1rem;
    }

    .hist-mascota-name {
      display: block;
      font-family: 'Playfair Display', serif;
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--vc-text);
    }

    .hist-mascota-meta {
      display: block;
      font-size: 0.75rem;
      color: var(--vc-text-muted);
    }

    /* Secciones */
    .hist-section {
      background-color: var(--vc-bg);
      border: 1px solid var(--vc-border);
      border-radius: 8px;
      padding: 0.7rem 0.9rem;
      height: 100%;
    }

    .hist-section-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: var(--vc-text-muted);
      margin-bottom: 0.35rem;
    }

    /* Tabla de medicamentos */
    .hist-med-table thead th {
      font-size: 0.68rem !important;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      background-color: var(--vc-bg) !important;
      color: var(--vc-text-muted) !important;
      border-color: var(--vc-border) !important;
      padding: 0.5rem 0.75rem;
    }

    .hist-med-table td {
      border-color: var(--vc-border) !important;
      padding: 0.5rem 0.75rem;
      vertical-align: middle;
    }

    /* Chips de meta */
    .hist-meta-chip {
      font-size: 0.8rem;
      color: var(--vc-text-muted);
      background: var(--vc-bg);
      border: 1px solid var(--vc-border);
      border-radius: 20px;
      padding: 0.25rem 0.75rem;
    }
  `]
})
export class HistorialComponent implements OnInit {
  filtroMascota = new FormControl('');
  mascotas: Mascota[] = [];
  registros$!: Observable<RegistroConMascota[]>;
  totalRegistros = 0;
  private esVeterinario = false;
  private idDueno = '';

  constructor(
    private citaService: CitaService,
    private mascotaService: MascotaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.esVeterinario = this.authService.esVeterinario();
    const usuario = this.authService.usuarioActual;
    if (usuario instanceof DuenoMascota) {
      this.idDueno = usuario.id;
    }

    // mascotas$ se incluye dentro del combineLatest para evitar
    // condición de carrera: si se suscribe por separado, this.mascotas
    // puede estar vacío cuando el filtro del historial se ejecuta por primera vez.
    this.registros$ = combineLatest([
      this.citaService.historial$,
      this.mascotaService.mascotas$,
      this.filtroMascota.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([historial, todasMascotas, filtro]) => {

        // Mascotas visibles para este usuario, calculadas síncronamente
        const mascotasVisibles = this.esVeterinario
          ? todasMascotas
          : todasMascotas.filter(m => m.idDueno === this.idDueno);

        // Actualizar el array del select de filtro
        this.mascotas = mascotasVisibles;

        // Filtrar solo los registros de mascotas que le pertenecen
        let base = this.esVeterinario
          ? historial
          : historial.filter(r =>
              mascotasVisibles.some(m => m.id === r.idMascota)
            );

        if (filtro) {
          base = base.filter(r => r.idMascota === filtro);
        }

        const resultado = base
          .sort((a, b) =>
            new Date(b.fechaAtencion).getTime() - new Date(a.fechaAtencion).getTime()
          )
          .map(r => ({
            ...r,
            mascota: this.mascotaService.obtenerPorId(r.idMascota)
          }));

        this.totalRegistros = resultado.length;
        return resultado;
      })
    );
  }

  getIconoEspecie(especie: string): string {
    const m: Record<string, string> = {
      'Perro': 'bi bi-dribbble', 'Gato': 'bi bi-star',
      'Ave': 'bi bi-feather', 'Conejo': 'bi bi-circle',
      'Reptil': 'bi bi-lightning'
    };
    return m[especie] ?? 'bi bi-paw';
  }
}
