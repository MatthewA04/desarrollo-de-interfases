import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { MascotaService } from '../../../core/services/mascota.service';
import { DuenoService, AuthService } from '../../../core/services/auth.service';
import { DuenoMascota } from '../../../core/models/usuario.model';
import { Mascota, Especie, EstadoSalud } from '../../../core/models/mascota.model';
import { EdadMascotaPipe } from '../../../shared/pipes/custom-pipes';
import { EstadoSaludColorDirective } from '../../../shared/directives/custom-directives';

@Component({
  selector: 'app-lista-mascotas',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    EdadMascotaPipe, EstadoSaludColorDirective
  ],
  template: `
    <div class="container-fluid py-4 px-4">

      <!-- Encabezado -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 page-title mb-0">
            {{ esVeterinario ? 'Mascotas registradas' : 'Mis Mascotas' }}
          </h2>
          <p class="small mb-0" style="color:var(--vc-text-muted)">
            {{ mascotasFiltradas.length }} registro(s)
          </p>
        </div>
        <a routerLink="/mascotas/nueva" class="btn btn-primary btn-sm">
          <i class="bi bi-plus-circle me-1"></i>
          {{ esVeterinario ? 'Nueva mascota' : 'Agregar mascota' }}
        </a>
      </div>

      <!-- Buscador + filtros — una sola barra compacta -->
      <div class="card mb-4">
        <div class="card-body py-3">
          <div class="row g-2 align-items-end">
            <div class="col-md-5">
              <div class="input-group input-group-sm">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input type="text" class="form-control"
                       placeholder="Buscar por nombre o raza…"
                       [formControl]="busqueda">
                <button class="btn btn-outline-secondary"
                        *ngIf="busqueda.value"
                        (click)="busqueda.setValue('')">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
            <div class="col-md-3">
              <select class="form-select form-select-sm"
                      [formControl]="filtroEspecie">
                <option value="">Todas las especies</option>
                <option *ngFor="let e of especies" [value]="e">{{ e }}</option>
              </select>
            </div>
            <div class="col-md-3">
              <select class="form-select form-select-sm"
                      [formControl]="filtroEstado">
                <option value="">Todos los estados</option>
                <option *ngFor="let e of estadosSalud" [value]="e">{{ e }}</option>
              </select>
            </div>
            <div class="col-md-1">
              <button class="btn btn-outline-secondary btn-sm w-100"
                      (click)="limpiarFiltros()"
                      title="Limpiar filtros">
                <i class="bi bi-funnel"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista: sin resultados -->
      <div *ngIf="mascotasFiltradas.length === 0"
           class="text-center py-5">
        <i class="bi bi-search"
           style="font-size:2.5rem;color:var(--vc-border)"></i>
        <p class="mt-3 mb-1 fw-bold" style="color:var(--vc-text)">
          Sin resultados
        </p>
        <p class="small" style="color:var(--vc-text-muted)">
          Prueba con otros filtros o registra una nueva mascota.
        </p>
        <a routerLink="/mascotas/nueva" class="btn btn-primary btn-sm mt-1">
          <i class="bi bi-plus me-1"></i>Registrar mascota
        </a>
      </div>

      <!-- Vista: tabla en desktop, cards en móvil -->
      <div *ngIf="mascotasFiltradas.length > 0">

        <!-- TABLA — visible desde md -->
        <div class="card d-none d-md-block">
          <div class="table-responsive">
            <table class="table mb-0 lm-table">
              <thead>
                <tr>
                  <th>Mascota</th>
                  <th>Especie / Raza</th>
                  <th>Sexo</th>
                  <th>Edad</th>
                  <th>Peso</th>
                  <th>Estado</th>
                  <th *ngIf="esVeterinario">Dueño</th>
                  <th style="width:100px"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of mascotasFiltradas" class="lm-row">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="lm-avatar">
                        <i class="{{ getIconoEspecie(m.especie) }}"></i>
                      </div>
                      <div>
                        <div class="fw-bold"
                             style="font-family:'Playfair Display',serif">
                          {{ m.nombre }}
                        </div>
                        <div class="lm-etapa">
                          {{ m.obtenerEtapaVida() }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="small" style="color:var(--vc-text)">{{ m.especie }}</div>
                    <div class="lm-etapa">{{ m.raza }}</div>
                  </td>
                  <td class="small">{{ m.sexo }}</td>
                  <td class="small">{{ m.edad | edadMascota }}</td>
                  <td class="small">{{ m.peso }} kg</td>
                  <td>
                    <span [appEstadoSaludColor]="m.estadoSalud"
                          style="font-size:0.75rem">
                      {{ m.estadoSalud }}
                    </span>
                  </td>
                  <td *ngIf="esVeterinario" class="small"
                      style="color:var(--vc-text-muted)">
                    {{ getNombreDueno(m.idDueno) }}
                  </td>
                  <td>
                    <div class="d-flex gap-1">
                      <a [routerLink]="['/mascotas', m.id]"
                         class="btn btn-outline-primary btn-sm"
                         title="Ver ficha">
                        <i class="bi bi-eye"></i>
                      </a>
                      <a routerLink="/citas/nueva"
                         class="btn btn-outline-success btn-sm"
                         title="Nueva cita">
                        <i class="bi bi-calendar-plus"></i>
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- CARDS — visible solo en móvil (< md) -->
        <div class="row g-3 d-md-none">
          <div *ngFor="let m of mascotasFiltradas" class="col-12">
            <div class="card hover-card">
              <div class="card-body">
                <div class="d-flex align-items-start gap-3">
                  <div class="lm-avatar">
                    <i class="{{ getIconoEspecie(m.especie) }}"></i>
                  </div>
                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between">
                      <h6 class="mb-0"
                          style="font-family:'Playfair Display',serif">
                        {{ m.nombre }}
                      </h6>
                      <span [appEstadoSaludColor]="m.estadoSalud"
                            style="font-size:0.72rem">
                        {{ m.estadoSalud }}
                      </span>
                    </div>
                    <div class="small mt-1" style="color:var(--vc-text-muted)">
                      {{ m.especie }} · {{ m.raza }} · {{ m.edad | edadMascota }}
                    </div>
                    <div class="d-flex gap-2 mt-2">
                      <a [routerLink]="['/mascotas', m.id]"
                         class="btn btn-outline-primary btn-sm">
                        <i class="bi bi-eye me-1"></i>Ver
                      </a>
                      <a routerLink="/citas/nueva"
                         class="btn btn-outline-success btn-sm">
                        <i class="bi bi-calendar-plus me-1"></i>Cita
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* Tabla */
    .lm-table thead th {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      font-weight: 700;
      color: var(--vc-text-muted);
      background-color: var(--vc-bg);
      border-bottom: 1px solid var(--vc-border);
      padding: 0.85rem 1rem;
    }

    .lm-table td {
      padding: 0.85rem 1rem;
      vertical-align: middle;
      border-bottom: 1px solid var(--vc-border);
    }

    .lm-row:last-child td { border-bottom: none; }

    .lm-row:hover td {
      background-color: var(--vc-bg);
    }

    /* Avatar especie */
    .lm-avatar {
      width: 36px; height: 36px;
      border-radius: 10px;
      background-color: var(--vc-primary-lt);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem;
      color: var(--vc-primary);
      flex-shrink: 0;
    }

    .lm-etapa {
      font-size: 0.72rem;
      color: var(--vc-text-muted);
      margin-top: 1px;
    }
  `]
})
export class ListaMascotasComponent implements OnInit, OnDestroy {
  mascotasFiltradas: Mascota[] = [];
  especies = Object.values(Especie);
  estadosSalud = Object.values(EstadoSalud);
  esVeterinario = false;
  idDueno = '';

  busqueda      = new FormControl('');
  filtroEspecie = new FormControl('');
  filtroEstado  = new FormControl('');

  private destroy$ = new Subject<void>();

  constructor(
    private mascotaService: MascotaService,
    private duenoService: DuenoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.esVeterinario = this.authService.esVeterinario();
    const usuario = this.authService.usuarioActual;
    if (usuario instanceof DuenoMascota) {
      this.idDueno = usuario.id;
    }

    combineLatest([
      this.mascotaService.mascotas$,
      this.busqueda.valueChanges.pipe(startWith(''), debounceTime(300), distinctUntilChanged()),
      this.filtroEspecie.valueChanges.pipe(startWith('')),
      this.filtroEstado.valueChanges.pipe(startWith(''))
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(([mascotas, busq, especie, estado]) => {
        const base = this.esVeterinario
          ? mascotas
          : mascotas.filter(m => m.idDueno === this.idDueno);

        const t = (busq ?? '').toLowerCase();
        this.mascotasFiltradas = base.filter(m =>
          (!t || m.nombre.toLowerCase().includes(t) || m.raza.toLowerCase().includes(t))
          && (!especie || m.especie === especie)
          && (!estado  || m.estadoSalud === estado)
        );
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getNombreDueno(id: string): string {
    return this.duenoService.obtenerPorId(id)?.nombre ?? '—';
  }

  getIconoEspecie(especie: string): string {
    const m: Record<string, string> = {
      'Perro': 'bi bi-dribbble', 'Gato': 'bi bi-star',
      'Ave': 'bi bi-feather', 'Conejo': 'bi bi-circle',
      'Reptil': 'bi bi-lightning', 'Otro': 'bi bi-paw'
    };
    return m[especie] ?? 'bi bi-paw';
  }

  limpiarFiltros(): void {
    this.busqueda.setValue('');
    this.filtroEspecie.setValue('');
    this.filtroEstado.setValue('');
  }
}
