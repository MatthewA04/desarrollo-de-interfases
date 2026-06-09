import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MascotaService } from '../../../core/services/mascota.service';
import { DuenoService, AuthService } from '../../../core/services/auth.service';
import { CitaService } from '../../../core/services/cita.service';
import { Mascota } from '../../../core/models/mascota.model';
import { EdadMascotaPipe, FechaCitaPipe, EstadoBadgePipe } from '../../../shared/pipes/custom-pipes';
import { EstadoSaludColorDirective } from '../../../shared/directives/custom-directives';
import { Observable } from 'rxjs';
import { IRegistroAtencion } from '../../../core/models/cita.model';

@Component({
  selector: 'app-detalle-mascota',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    EdadMascotaPipe,
    FechaCitaPipe,
    EstadoBadgePipe,
    EstadoSaludColorDirective
  ],
  template: `
    <div class="container-fluid py-4 px-4" *ngIf="mascota; else notFound">

      <!-- Breadcrumb -->
      <nav class="mb-4" aria-label="breadcrumb">
        <ol class="breadcrumb" style="font-size:0.83rem">
          <li class="breadcrumb-item">
            <a routerLink="/mascotas"
               style="color:var(--vc-primary);text-decoration:none">
              Mascotas
            </a>
          </li>
          <li class="breadcrumb-item active" style="color:var(--vc-text-muted)">
            {{ mascota.nombre }}
          </li>
        </ol>
      </nav>

      <!-- ── CABECERA TIPO "FICHA" ── -->
      <div class="detalle-hero card mb-4">
        <div class="card-body p-0">
          <div class="row g-0 align-items-stretch">

            <!-- Franja de color con icono de especie -->
            <div class="col-auto detalle-hero-side d-flex flex-column
                        align-items-center justify-content-center p-4">
              <div class="detalle-species-icon">
                <i class="{{ getIconoEspecie(mascota.especie) }}"></i>
              </div>
              <span class="detalle-species-label mt-2">{{ mascota.especie }}</span>
            </div>

            <!-- Datos principales -->
            <div class="col p-4">
              <div class="d-flex justify-content-between align-items-start
                          flex-wrap gap-3 mb-3">
                <div>
                  <h1 class="detalle-nombre mb-0">{{ mascota.nombre }}</h1>
                  <p class="detalle-raza mb-0">{{ mascota.raza }}</p>
                </div>
                <span [appEstadoSaludColor]="mascota.estadoSalud"
                      style="font-size:0.82rem;white-space:nowrap">
                  {{ mascota.estadoSalud }}
                </span>
              </div>

              <!-- Chips de datos -->
              <div class="d-flex flex-wrap gap-2 mb-4">
                <div class="detalle-chip">
                  <i class="bi bi-gender-ambiguous me-1"></i>
                  {{ mascota.sexo }}
                </div>
                <div class="detalle-chip">
                  <i class="bi bi-clock me-1"></i>
                  {{ mascota.edad | edadMascota }}
                </div>
                <div class="detalle-chip">
                  <i class="bi bi-speedometer2 me-1"></i>
                  {{ mascota.peso }} kg
                </div>
                <div class="detalle-chip">
                  <i class="bi bi-stars me-1"></i>
                  {{ mascota.obtenerEtapaVida() }}
                </div>
              </div>

              <!-- Dueño y fecha -->
              <div class="d-flex flex-wrap gap-4"
                   style="font-size:0.84rem;color:var(--vc-text-muted)">
                <span>
                  <i class="bi bi-person-circle me-1"
                     style="color:var(--vc-primary)"></i>
                  <strong style="color:var(--vc-text)">Dueño: </strong>
                  {{ nombreDueno }}
                </span>
                <span>
                  <i class="bi bi-calendar3 me-1"
                     style="color:var(--vc-primary)"></i>
                  <strong style="color:var(--vc-text)">Registrado: </strong>
                  {{ mascota.fechaRegistro | date:'dd MMM yyyy' }}
                </span>
              </div>
            </div>

            <!-- Botón lateral -->
            <div class="col-auto d-flex align-items-center p-4"
                 style="border-left:1px solid var(--vc-border)">
              <a routerLink="/citas/nueva"
                 class="btn btn-primary d-flex flex-column align-items-center
                        gap-1 px-3 py-3">
                <i class="bi bi-calendar-plus" style="font-size:1.3rem"></i>
                <span style="font-size:0.78rem;line-height:1.2">
                  Solicitar<br>Cita
                </span>
              </a>
            </div>

          </div>
        </div>
      </div>

      <!-- ── CUERPO: dos columnas ── -->
      <div class="row g-4">

        <!-- Columna izquierda: métricas rápidas -->
        <div class="col-md-3">

          <!-- Tarjeta de resumen clínico -->
          <div class="card mb-3">
            <div class="card-header bg-white py-3">
              <h6 class="mb-0 fw-bold">
                <i class="bi bi-clipboard2-pulse me-2"
                   style="color:var(--vc-primary)"></i>Resumen clínico
              </h6>
            </div>
            <div class="card-body p-0">
              <div class="detalle-stat-row">
                <span style="color:var(--vc-text-muted);font-size:0.82rem">
                  Consultas totales
                </span>
                <strong>{{ totalConsultas }}</strong>
              </div>
              <div class="detalle-stat-row">
                <span style="color:var(--vc-text-muted);font-size:0.82rem">
                  Último control
                </span>
                <strong style="font-size:0.82rem">{{ ultimaConsulta }}</strong>
              </div>
              <div class="detalle-stat-row" style="border:none">
                <span style="color:var(--vc-text-muted);font-size:0.82rem">
                  Estado actual
                </span>
                <span [appEstadoSaludColor]="mascota.estadoSalud"
                      style="font-size:0.72rem">
                  {{ mascota.estadoSalud }}
                </span>
              </div>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="card">
            <div class="card-header bg-white py-3">
              <h6 class="mb-0 fw-bold">
                <i class="bi bi-lightning me-2"
                   style="color:var(--vc-accent)"></i>Acciones
              </h6>
            </div>
            <div class="card-body d-grid gap-2 py-3">
              <a routerLink="/citas/nueva"
                 class="btn btn-outline-primary btn-sm text-start">
                <i class="bi bi-calendar-plus me-2"></i>Nueva cita
              </a>
              <a routerLink="/historial"
                 class="btn btn-outline-secondary btn-sm text-start">
                <i class="bi bi-clock-history me-2"></i>Ver historial completo
              </a>
              <a routerLink="/mascotas"
                 class="btn btn-outline-secondary btn-sm text-start">
                <i class="bi bi-arrow-left me-2"></i>Volver a la lista
              </a>
            </div>
          </div>
        </div>

        <!-- Columna derecha: historial clínico tipo timeline -->
        <div class="col-md-9">
          <div class="card">
            <div class="card-header bg-white py-3 d-flex justify-content-between
                        align-items-center">
              <h5 class="mb-0 fw-bold">
                <i class="bi bi-journal-medical me-2"
                   style="color:var(--vc-primary)"></i>
                Historial de Atención
              </h5>
              <span class="badge"
                    style="background-color:var(--vc-primary-lt);
                           color:var(--vc-primary-dk);font-size:0.72rem">
                {{ totalConsultas }} consulta(s)
              </span>
            </div>

            <div class="card-body py-3 px-4">
              <ng-container *ngIf="historial$ | async as historial">

                <!-- Estado vacío -->
                <div *ngIf="historial.length === 0"
                     class="text-center py-5">
                  <div class="detalle-empty-icon">
                    <i class="bi bi-journal-x"></i>
                  </div>
                  <p class="mt-3 mb-1 fw-bold" style="color:var(--vc-text)">
                    Sin registros aún
                  </p>
                  <p class="small" style="color:var(--vc-text-muted)">
                    Las consultas aparecerán aquí una vez que se completen.
                  </p>
                </div>

                <!-- Timeline -->
                <div class="detalle-timeline">
                  <div *ngFor="let reg of historial; let last = last"
                       class="detalle-tl-item">

                    <!-- Indicador lateral -->
                    <div class="detalle-tl-aside">
                      <div class="detalle-tl-dot"></div>
                      <div class="detalle-tl-line" *ngIf="!last"></div>
                    </div>

                    <!-- Tarjeta de la consulta -->
                    <div class="detalle-tl-card">

                      <!-- Encabezado -->
                      <div class="detalle-tl-header">
                        <div>
                          <span class="detalle-tl-label">Consulta</span>
                          <div class="detalle-tl-date">
                            <i class="bi bi-calendar3 me-1"></i>
                            {{ reg.fechaAtencion | date:'d MMMM yyyy' }}
                            &nbsp;·&nbsp;
                            {{ reg.fechaAtencion | date:'HH:mm' }}
                          </div>
                        </div>
                        <div class="text-end">
                          <span class="detalle-tl-weight">
                            <i class="bi bi-speedometer2 me-1"></i>
                            {{ reg.pesoEnConsulta }} kg
                          </span>
                        </div>
                      </div>

                      <!-- Diagnóstico y tratamiento -->
                      <div class="row g-3 mb-3">
                        <div class="col-md-6">
                          <div class="detalle-tl-section">
                            <div class="detalle-tl-section-title">
                              <i class="bi bi-search-heart me-1"></i>
                              Diagnóstico
                            </div>
                            <p class="mb-0">{{ reg.diagnostico }}</p>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="detalle-tl-section">
                            <div class="detalle-tl-section-title">
                              <i class="bi bi-heart-pulse me-1"></i>
                              Tratamiento
                            </div>
                            <p class="mb-0">{{ reg.tratamiento }}</p>
                          </div>
                        </div>
                      </div>

                      <!-- Medicamentos -->
                      <div *ngIf="reg.medicamentos?.length" class="mb-3">
                        <div class="detalle-tl-section-title mb-2">
                          <i class="bi bi-capsule me-1"></i>Medicamentos
                        </div>
                        <div class="d-flex flex-wrap gap-2">
                          <div *ngFor="let med of reg.medicamentos"
                               class="detalle-med-pill">
                            <div class="detalle-med-name">{{ med.nombre }}</div>
                            <div class="detalle-med-detail">
                              {{ med.dosis }} · {{ med.frecuencia }}
                              · {{ med.duracionDias }}d
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Próxima visita -->
                      <div *ngIf="reg.proximaVisita"
                           class="detalle-tl-proxima">
                        <i class="bi bi-calendar-check me-2"></i>
                        Próxima visita sugerida:
                        <strong>{{ reg.proximaVisita | fechaCita }}</strong>
                      </div>

                      <!-- Observaciones -->
                      <p *ngIf="reg.observaciones"
                         class="mb-0 mt-2"
                         style="font-size:0.82rem;color:var(--vc-text-muted);
                                font-style:italic;border-top:1px solid var(--vc-border);
                                padding-top:0.5rem">
                        <i class="bi bi-chat-quote me-1"></i>
                        {{ reg.observaciones }}
                      </p>

                    </div>
                  </div>
                </div>

              </ng-container>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Not found -->
    <ng-template #notFound>
      <div class="text-center py-5">
        <i class="bi bi-search"
           style="font-size:3rem;color:var(--vc-border)"></i>
        <h3 class="mt-3" style="font-family:'Playfair Display',serif">
          Mascota no encontrada
        </h3>
        <a routerLink="/mascotas" class="btn btn-primary mt-2">
          Volver a la lista
        </a>
      </div>
    </ng-template>
  `,
  styles: [`
    /* ── Hero ── */
    .detalle-hero {
      overflow: hidden;
    }

    .detalle-hero-side {
      min-width: 110px;
      background: linear-gradient(160deg,
        var(--vc-primary-lt) 0%,
        var(--vc-accent-lt) 100%);
      border-right: 1px solid var(--vc-border);
    }

    .detalle-species-icon {
      width: 56px; height: 56px;
      border-radius: 16px;
      background-color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem;
      color: var(--vc-primary);
      box-shadow: 0 2px 10px rgba(90,70,60,0.10);
    }

    .detalle-species-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vc-text-muted);
    }

    .detalle-nombre {
      font-family: 'Playfair Display', serif;
      font-size: 1.9rem;
      font-weight: 700;
      color: var(--vc-text);
    }

    .detalle-raza {
      font-size: 0.9rem;
      color: var(--vc-text-muted);
    }

    /* ── Chips ── */
    .detalle-chip {
      background-color: var(--vc-bg);
      border: 1px solid var(--vc-border);
      border-radius: 20px;
      padding: 0.3rem 0.8rem;
      font-size: 0.8rem;
      color: var(--vc-text);
    }

    /* ── Stats laterales ── */
    .detalle-stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.65rem 1rem;
      border-bottom: 1px solid var(--vc-border);
    }

    /* ── Vacío ── */
    .detalle-empty-icon {
      width: 64px; height: 64px;
      border-radius: 50%;
      background-color: var(--vc-bg);
      border: 1px solid var(--vc-border);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.8rem;
      color: var(--vc-border);
      margin: 0 auto;
    }

    /* ── Timeline ── */
    .detalle-timeline {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .detalle-tl-item {
      display: flex;
      gap: 16px;
      padding-bottom: 1.5rem;
    }

    .detalle-tl-aside {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      width: 16px;
    }

    .detalle-tl-dot {
      width: 14px; height: 14px;
      border-radius: 50%;
      background-color: var(--vc-primary);
      border: 2px solid #fff;
      box-shadow: 0 0 0 2px var(--vc-primary);
      flex-shrink: 0;
      margin-top: 4px;
    }

    .detalle-tl-line {
      flex: 1;
      width: 2px;
      background-color: var(--vc-border);
      margin-top: 4px;
    }

    .detalle-tl-card {
      flex: 1;
      background-color: var(--vc-bg);
      border: 1px solid var(--vc-border);
      border-radius: 10px;
      padding: 1rem 1.2rem;
    }

    .detalle-tl-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.9rem;
      padding-bottom: 0.7rem;
      border-bottom: 1px solid var(--vc-border);
    }

    .detalle-tl-label {
      font-family: 'Playfair Display', serif;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--vc-text);
      display: block;
    }

    .detalle-tl-date {
      font-size: 0.78rem;
      color: var(--vc-text-muted);
      margin-top: 2px;
    }

    .detalle-tl-weight {
      font-size: 0.78rem;
      color: var(--vc-text-muted);
      background: #fff;
      border: 1px solid var(--vc-border);
      border-radius: 20px;
      padding: 0.2rem 0.6rem;
    }

    /* Sección diagnóstico/tratamiento */
    .detalle-tl-section {
      background: #fff;
      border: 1px solid var(--vc-border);
      border-radius: 8px;
      padding: 0.7rem 0.9rem;
      font-size: 0.84rem;
      color: var(--vc-text);
      height: 100%;
    }

    .detalle-tl-section-title {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: var(--vc-text-muted);
      margin-bottom: 0.4rem;
    }

    /* Pastilla de medicamento */
    .detalle-med-pill {
      background: #fff;
      border: 1px solid var(--vc-border);
      border-left: 3px solid var(--vc-info);
      border-radius: 6px;
      padding: 0.4rem 0.75rem;
    }

    .detalle-med-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--vc-text);
    }

    .detalle-med-detail {
      font-size: 0.72rem;
      color: var(--vc-text-muted);
      margin-top: 1px;
    }

    /* Próxima visita */
    .detalle-tl-proxima {
      font-size: 0.82rem;
      background-color: var(--vc-primary-lt);
      border: 1px solid var(--vc-primary);
      border-radius: 6px;
      padding: 0.4rem 0.75rem;
      color: var(--vc-primary-dk);
    }
  `]
})
export class DetalleMascotaComponent implements OnInit {
  mascota?: Mascota;
  nombreDueno = '';
  historial$!: Observable<IRegistroAtencion[]>;
  totalConsultas = 0;
  ultimaConsulta = 'Sin registros';

  constructor(
    private route: ActivatedRoute,
    private mascotaService: MascotaService,
    private duenoService: DuenoService,
    private citaService: CitaService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.mascota = this.mascotaService.obtenerPorId(id);

    if (this.mascota) {
      this.nombreDueno = this.duenoService.obtenerPorId(this.mascota.idDueno)?.nombre
        ?? 'Desconocido';
      this.historial$ = this.citaService.obtenerHistorialPorMascota(this.mascota.id);

      // Estadísticas de resumen clínico
      this.historial$.subscribe(historial => {
        this.totalConsultas = historial.length;
        if (historial.length > 0) {
          const ultima = new Date(historial[0].fechaAtencion);
          this.ultimaConsulta = ultima.toLocaleDateString('es-PE', {
            day: '2-digit', month: 'short', year: 'numeric'
          });
        }
      });
    }
  }

  // Devuelve clase Bootstrap Icon según la especie
  getIconoEspecie(especie: string): string {
    const iconos: Record<string, string> = {
      'Perro':  'bi bi-dribbble',
      'Gato':   'bi bi-star',
      'Ave':    'bi bi-feather',
      'Conejo': 'bi bi-circle',
      'Reptil': 'bi bi-lightning',
      'Otro':   'bi bi-paw'
    };
    return iconos[especie] ?? 'bi bi-paw';
  }

  // Alias para compatibilidad con el template (el enunciado pide getEmoji)
  getEmoji(especie: string): string {
    return this.getIconoEspecie(especie);
  }
}
