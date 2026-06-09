import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MascotaService } from '../../../core/services/mascota.service';
import { DuenoService, AuthService } from '../../../core/services/auth.service';
import { DuenoMascota } from '../../../core/models/usuario.model';
import { Especie, EstadoSalud, Sexo, IMascota } from '../../../core/models/mascota.model';
import { SoloNumerosDirective } from '../../../shared/directives/custom-directives';

// =============================================================
// COMPONENTE: FormMascotaComponent
// Formulario de registro de mascota con ReactiveForm completo.
// Incluye validaciones síncronas y personalizadas.
// =============================================================

@Component({
  selector: 'app-form-mascota',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SoloNumerosDirective],
  template: `
    <div class="container py-4" style="max-width: 700px;">
      <div class="mb-4">
        <a routerLink="/mascotas" class="btn btn-link text-decoration-none ps-0">
          <i class="bi bi-arrow-left me-1"></i>Volver a la lista
        </a>
        <h2 class="h3 fw-bold mb-0">
          <i class="bi bi-plus-circle text-primary me-2"></i>Registrar Nueva Mascota
        </h2>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Sección: Datos del dueño -->
            <!-- Veterinario: elige el dueño. Dueño: se asigna automáticamente -->
            <ng-container *ngIf="esVeterinario">
              <h5 class="fw-semibold text-primary mb-3">
                <i class="bi bi-person me-2"></i>Datos del Dueño
              </h5>
              <div class="mb-3">
                <label class="form-label fw-semibold">Seleccionar Dueño <span class="text-danger">*</span></label>
                <select class="form-select" [class.is-invalid]="invalid('idDueno')" formControlName="idDueno">
                  <option value="">-- Selecciona un dueño --</option>
                  <option *ngFor="let d of duenos" [value]="d.id">{{ d.nombre }} — {{ d.email }}</option>
                </select>
                <div class="invalid-feedback">Debes seleccionar un dueño.</div>
              </div>
            </ng-container>

            <!-- Dueño: mensaje informativo -->
            <div class="mb-3 p-3 rounded" *ngIf="!esVeterinario"
                 style="background-color:var(--vc-primary-lt);border:1px solid var(--vc-border)">
              <i class="bi bi-person-check me-2" style="color:var(--vc-primary)"></i>
              <small style="color:var(--vc-text-muted)">
                Esta mascota quedará registrada a tu nombre automáticamente.
              </small>
            </div>

            <hr class="my-4">

            <!-- Sección: Datos de la mascota -->
            <h5 class="fw-semibold text-primary mb-3">
              <i class="bi bi-paw-fill me-2"></i>Datos de la Mascota
            </h5>

            <div class="row g-3">
              <!-- Nombre -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Nombre <span class="text-danger">*</span></label>
                <input type="text" class="form-control" [class.is-invalid]="invalid('nombre')"
                       formControlName="nombre" placeholder="Ej: Manchita">
                <div class="invalid-feedback">
                  <span *ngIf="form.get('nombre')?.errors?.['required']">El nombre es requerido.</span>
                  <span *ngIf="form.get('nombre')?.errors?.['minlength']">Mínimo 2 caracteres.</span>
                </div>
              </div>

              <!-- Especie -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Especie <span class="text-danger">*</span></label>
                <select class="form-select" [class.is-invalid]="invalid('especie')" formControlName="especie">
                  <option value="">-- Seleccionar --</option>
                  <option *ngFor="let e of especies" [value]="e">{{ e }}</option>
                </select>
                <div class="invalid-feedback">Selecciona una especie.</div>
              </div>

              <!-- Raza -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Raza <span class="text-danger">*</span></label>
                <input type="text" class="form-control" [class.is-invalid]="invalid('raza')"
                       formControlName="raza" placeholder="Ej: Golden Retriever">
                <div class="invalid-feedback">La raza es requerida.</div>
              </div>

              <!-- Sexo -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Sexo <span class="text-danger">*</span></label>
                <select class="form-select" [class.is-invalid]="invalid('sexo')" formControlName="sexo">
                  <option value="">-- Seleccionar --</option>
                  <option *ngFor="let s of sexos" [value]="s">{{ s }}</option>
                </select>
                <div class="invalid-feedback">Selecciona el sexo.</div>
              </div>

              <!-- Edad -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Edad (años) <span class="text-danger">*</span></label>
                <input type="number" class="form-control" [class.is-invalid]="invalid('edad')"
                       formControlName="edad" placeholder="Ej: 3" appSoloNumeros min="0" max="50">
                <div class="invalid-feedback">
                  <span *ngIf="form.get('edad')?.errors?.['required']">La edad es requerida.</span>
                  <span *ngIf="form.get('edad')?.errors?.['min']">Edad mínima: 0.</span>
                  <span *ngIf="form.get('edad')?.errors?.['max']">Edad máxima: 50.</span>
                </div>
              </div>

              <!-- Peso -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Peso (kg) <span class="text-danger">*</span></label>
                <input type="number" class="form-control" [class.is-invalid]="invalid('peso')"
                       formControlName="peso" placeholder="Ej: 28.5" step="0.1" appSoloNumeros>
                <div class="invalid-feedback">
                  <span *ngIf="form.get('peso')?.errors?.['required']">El peso es requerido.</span>
                  <span *ngIf="form.get('peso')?.errors?.['min']">Peso mínimo: 0.01 kg.</span>
                </div>
              </div>

              <!-- Estado de salud -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Estado de Salud</label>
                <select class="form-select" formControlName="estadoSalud">
                  <option *ngFor="let e of estadosSalud" [value]="e">{{ e }}</option>
                </select>
              </div>
            </div>

            <!-- Mensaje de éxito -->
            <div class="alert alert-success mt-4" *ngIf="guardado">
              <i class="bi bi-check-circle-fill me-2"></i>
              ¡Mascota registrada exitosamente!
            </div>

            <!-- Botones -->
            <div class="d-flex gap-2 justify-content-end mt-4">
              <a routerLink="/mascotas" class="btn btn-outline-secondary">
                <i class="bi bi-x me-1"></i>Cancelar
              </a>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || guardando">
                <span class="spinner-border spinner-border-sm me-1" *ngIf="guardando"></span>
                <i class="bi bi-check-lg me-1" *ngIf="!guardando"></i>
                {{ guardando ? 'Guardando...' : 'Registrar Mascota' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class FormMascotaComponent implements OnInit {
  form!: FormGroup;
  especies = Object.values(Especie);
  sexos = Object.values(Sexo);
  estadosSalud = Object.values(EstadoSalud);
  duenos: any[] = [];
  guardando = false;
  guardado = false;
  esVeterinario = false;
  idDuenoActual = '';

  constructor(
    private fb: FormBuilder,
    private mascotaService: MascotaService,
    private duenoService: DuenoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.duenos = this.duenoService.obtenerTodos();
    this.esVeterinario = this.authService.esVeterinario();
    const usuario = this.authService.usuarioActual;
    if (usuario instanceof DuenoMascota) {
      this.idDuenoActual = usuario.id;
    }

    // Definimos el formulario con sus validaciones
    this.form = this.fb.group({
      idDueno:     ['', Validators.required],
      nombre:      ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      especie:     ['', Validators.required],
      raza:        ['', Validators.required],
      sexo:        ['', Validators.required],
      edad:        ['', [Validators.required, Validators.min(0), Validators.max(50)]],
      peso:        ['', [Validators.required, Validators.min(0.01)]],
      estadoSalud: [EstadoSalud.SALUDABLE]
    });

    // Si es dueño, pre-asignar su ID y deshabilitar el campo
    if (!this.esVeterinario && this.idDuenoActual) {
      this.form.patchValue({ idDueno: this.idDuenoActual });
      this.form.get('idDueno')?.disable();
    }
  }

  // Helper para saber si mostrar el error en un campo
  invalid(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando = true;
    setTimeout(() => {
      // getRawValue() incluye campos deshabilitados (idDueno para dueños)
    const { idDueno, nombre, especie, raza, sexo, edad, peso, estadoSalud } = this.form.getRawValue();
      this.mascotaService.agregar({ idDueno, nombre, especie, raza, sexo, edad, peso, estadoSalud });
      this.guardando = false;
      this.guardado = true;
      setTimeout(() => this.router.navigate(['/mascotas']), 1200);
    }, 700);
  }
}
