import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CitaService } from '../../../core/services/cita.service';
import { MascotaService } from '../../../core/services/mascota.service';
import { VeterinarioService, DuenoService, AuthService } from '../../../core/services/auth.service';
import { DuenoMascota } from '../../../core/models/usuario.model';
import { TipoConsulta, EstadoCita } from '../../../core/models/cita.model';

@Component({
  selector: 'app-form-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-4" style="max-width: 650px;">
      <div class="mb-4">
        <a routerLink="/citas" class="btn btn-link text-decoration-none ps-0">
          <i class="bi bi-arrow-left me-1"></i>Volver a la agenda
        </a>
        <h2 class="h3 fw-bold mb-0">
          <i class="bi bi-calendar-plus text-primary me-2"></i>Agendar Nueva Cita
        </h2>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Mascota -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Mascota <span class="text-danger">*</span></label>
              <select class="form-select" [class.is-invalid]="invalid('idMascota')" formControlName="idMascota">
                <option value="">-- Seleccionar mascota --</option>
                <option *ngFor="let m of mascotas" [value]="m.id">
                  {{ m.nombre }} ({{ m.especie }}) — Dueño: {{ getNombreDueno(m.idDueno) }}
                </option>
              </select>
              <div class="invalid-feedback">Selecciona una mascota.</div>
            </div>

            <!-- Veterinario -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Veterinario <span class="text-danger">*</span></label>
              <select class="form-select" [class.is-invalid]="invalid('idVeterinario')" formControlName="idVeterinario">
                <option value="">-- Seleccionar veterinario --</option>
                <option *ngFor="let v of veterinarios" [value]="v.id">
                  {{ v.nombre }} — {{ v.especialidad }}
                </option>
              </select>
              <div class="invalid-feedback">Selecciona un veterinario.</div>
            </div>

            <!-- Tipo de consulta -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Tipo de Consulta <span class="text-danger">*</span></label>
              <select class="form-select" [class.is-invalid]="invalid('tipoConsulta')" formControlName="tipoConsulta">
                <option value="">-- Seleccionar --</option>
                <option *ngFor="let t of tiposConsulta" [value]="t">{{ t }}</option>
              </select>
              <div class="invalid-feedback">Selecciona el tipo de consulta.</div>
            </div>

            <!-- Fecha y hora -->
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Fecha <span class="text-danger">*</span></label>
                <input type="date" class="form-control" [class.is-invalid]="invalid('fecha')"
                       formControlName="fecha" [min]="hoyStr">
                <div class="invalid-feedback">La fecha es requerida.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Hora <span class="text-danger">*</span></label>
                <input type="time" class="form-control" [class.is-invalid]="invalid('hora')"
                       formControlName="hora" min="08:00" max="18:00">
                <div class="invalid-feedback">La hora es requerida (8:00 - 18:00).</div>
              </div>
            </div>

            <!-- Duración -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Duración</label>
              <select class="form-select" formControlName="duracionMinutos">
                <option [value]="15">15 minutos</option>
                <option [value]="30">30 minutos</option>
                <option [value]="45">45 minutos</option>
                <option [value]="60">1 hora</option>
              </select>
            </div>

            <!-- Motivo -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Motivo de Consulta <span class="text-danger">*</span></label>
              <textarea class="form-control" [class.is-invalid]="invalid('motivoConsulta')"
                        formControlName="motivoConsulta" rows="3"
                        placeholder="Describe el motivo de la consulta..."></textarea>
              <div class="invalid-feedback">El motivo es requerido.</div>
            </div>

            <!-- Error de conflicto -->
            <div class="alert alert-danger" *ngIf="errorConflicto">
              <i class="bi bi-exclamation-triangle me-1"></i> {{ errorConflicto }}
            </div>

            <!-- Éxito -->
            <div class="alert alert-success" *ngIf="guardado">
              <i class="bi bi-check-circle-fill me-2"></i>¡Cita agendada correctamente!
            </div>

            <div class="d-flex gap-2 justify-content-end">
              <a routerLink="/citas" class="btn btn-outline-secondary">Cancelar</a>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || guardando">
                <span class="spinner-border spinner-border-sm me-1" *ngIf="guardando"></span>
                <i class="bi bi-check-lg me-1" *ngIf="!guardando"></i>
                {{ guardando ? 'Agendando...' : 'Agendar Cita' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class FormCitaComponent implements OnInit {
  form!: FormGroup;
  tiposConsulta = Object.values(TipoConsulta);
  mascotas: any[] = [];
  veterinarios: any[] = [];
  hoyStr = new Date().toISOString().split('T')[0];
  guardando = false;
  guardado = false;
  errorConflicto = '';
  esVeterinario = false;
  idDuenoActual = '';

  constructor(
    private fb: FormBuilder,
    private citaService: CitaService,
    private mascotaService: MascotaService,
    private vetService: VeterinarioService,
    private duenoService: DuenoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.esVeterinario = this.authService.esVeterinario();
    const usuario = this.authService.usuarioActual;
    if (usuario instanceof DuenoMascota) {
      this.idDuenoActual = usuario.id;
    }

    // Dueño solo ve sus mascotas; veterinario ve todas
    const todasMascotas = this.mascotaService.obtenerTodas();
    this.mascotas = this.esVeterinario
      ? todasMascotas
      : todasMascotas.filter(m => m.idDueno === this.idDuenoActual);
    this.veterinarios = this.vetService.obtenerTodos();

    this.form = this.fb.group({
      idMascota:       ['', Validators.required],
      idVeterinario:   ['', Validators.required],
      tipoConsulta:    ['', Validators.required],
      fecha:           ['', Validators.required],
      hora:            ['', Validators.required],
      duracionMinutos: [30],
      motivoConsulta:  ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  invalid(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && (c?.dirty || c?.touched));
  }

  getNombreDueno(idDueno: string): string {
    return this.duenoService.obtenerPorId(idDueno)?.nombre ?? 'Dueño';
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const { idMascota, idVeterinario, tipoConsulta, fecha, hora, duracionMinutos, motivoConsulta } = this.form.value;
    const fechaObj = new Date(fecha + 'T' + hora);

    // Verificar conflicto de horario
    if (this.citaService.hayConflictoHorario(idVeterinario, fechaObj, hora, duracionMinutos)) {
      this.errorConflicto = `El veterinario ya tiene una cita a esa hora. Por favor elige otro horario.`;
      return;
    }

    this.guardando = true;
    this.errorConflicto = '';

    // Obtener idDueno desde la mascota seleccionada
    const mascota = this.mascotaService.obtenerPorId(idMascota);

    setTimeout(() => {
      this.citaService.agregar({
        idMascota,
        idVeterinario,
        idDueno: mascota?.idDueno ?? '',
        tipoConsulta,
        fecha: fechaObj,
        hora,
        duracionMinutos,
        motivoConsulta,
        estado: EstadoCita.PENDIENTE
      });
      this.guardando = false;
      this.guardado = true;
      setTimeout(() => this.router.navigate(['/citas']), 1200);
    }, 700);
  }
}
