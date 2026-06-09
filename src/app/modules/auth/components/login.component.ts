import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-wrapper min-vh-100 d-flex align-items-stretch">

      <!-- Panel izquierdo: imagen/branding -->
      <div class="login-panel-left d-none d-lg-flex flex-column justify-content-between p-5">

        <!-- Logo sobre el panel -->
        <div>
          <div class="login-logo-mark">
            <i class="bi bi-heart-pulse"></i>
          </div>
          <h1 class="login-brand mt-3">VetCare</h1>
          <p class="login-brand-sub">Clínica Veterinaria</p>
        </div>

        <!-- Imagen placeholder: en producción reemplazar src con la foto real -->
        <div class="login-img-placeholder">
          <img
            src="https://www.expomedhub.com/img/blog/veterinario-vet.jpg"
            alt="Clínica veterinaria"
            class="login-img"
          >
          <!-- Notificación decorativa debajo de la imagen -->
          <div class="login-notif">
            <div class="login-notif-dot"></div>
            <p class="login-notif-text">
              Atención de lunes a sábado &middot; 8:00 am – 6:00 pm
            </p>
          </div>
        </div>

        <!-- Detalle decorativo -->
        <div class="login-dots">
          <span></span><span></span><span></span>
        </div>
      </div>

      <!-- Panel derecho: formulario -->
      <div class="login-panel-right d-flex align-items-center justify-content-center p-4 p-lg-5">
        <div style="width:100%;max-width:400px">

          <!-- Encabezado mobile (solo visible en pantallas pequeñas) -->
          <div class="d-flex align-items-center gap-2 mb-4 d-lg-none">
            <i class="bi bi-heart-pulse"
               style="font-size:1.6rem;color:var(--vc-primary)"></i>
            <span style="font-family:'Playfair Display',serif;font-size:1.3rem;
                         color:var(--vc-text);font-weight:700">VetCare</span>
          </div>

          <h2 class="login-form-title">Bienvenido de vuelta</h2>
          <p class="login-form-sub mb-4">Ingresa tus datos para continuar</p>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">

            <!-- Email -->
            <div class="mb-3">
              <label class="form-label">Correo electrónico</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-envelope"></i>
                </span>
                <input type="email" class="form-control"
                       [class.is-invalid]="invalid('email')"
                       formControlName="email"
                       placeholder="correo@ejemplo.com">
              </div>
              <div class="form-text text-danger small mt-1"
                   *ngIf="invalid('email')">
                <span *ngIf="loginForm.get('email')?.errors?.['required']">
                  El correo es requerido.
                </span>
                <span *ngIf="loginForm.get('email')?.errors?.['email']">
                  Ingresa un correo válido.
                </span>
              </div>
            </div>

            <!-- Contraseña -->
            <div class="mb-4">
              <label class="form-label">Contraseña</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-lock"></i>
                </span>
                <input [type]="mostrarPass ? 'text' : 'password'"
                       class="form-control"
                       [class.is-invalid]="invalid('contrasena')"
                       formControlName="contrasena"
                       placeholder="••••••">
                <button class="btn btn-outline-secondary" type="button"
                        (click)="mostrarPass = !mostrarPass">
                  <i class="bi"
                     [class.bi-eye]="!mostrarPass"
                     [class.bi-eye-slash]="mostrarPass"></i>
                </button>
              </div>
              <div class="form-text text-danger small mt-1"
                   *ngIf="invalid('contrasena')">
                La contraseña es requerida.
              </div>
            </div>

            <!-- Error -->
            <div class="alert alert-danger py-2 small mb-3" *ngIf="errorLogin">
              <i class="bi bi-exclamation-triangle me-1"></i>{{ errorLogin }}
            </div>

            <!-- Botón -->
            <button type="submit" class="btn btn-primary w-100 py-2 mb-3"
                    [disabled]="loginForm.invalid || cargando">
              <span class="spinner-border spinner-border-sm me-2"
                    *ngIf="cargando"></span>
              <i class="bi bi-box-arrow-in-right me-1" *ngIf="!cargando"></i>
              {{ cargando ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </form>

          <!-- Divisor -->
          <div class="login-divider">
            <span>Accesos de demostración</span>
          </div>

          <!-- Demo accounts -->
          <div class="row g-2 mt-3">
            <div class="col-6">
              <button class="btn btn-demo w-100"
                      (click)="usarCredencial('vet@clinica.com','1234')">
                <i class="bi bi-person-badge mb-1 d-block"
                   style="font-size:1.1rem;color:var(--vc-primary)"></i>
                <span class="d-block" style="font-size:0.78rem;font-weight:700">
                  Veterinario
                </span>
                <span class="d-block"
                      style="font-size:0.7rem;color:var(--vc-text-muted)">
                  Dr. Hernán Quispe
                </span>
              </button>
            </div>
            <div class="col-6">
              <button class="btn btn-demo w-100"
                      (click)="usarCredencial('dueno@gmail.com','1234')">
                <i class="bi bi-person mb-1 d-block"
                   style="font-size:1.1rem;color:var(--vc-accent)"></i>
                <span class="d-block" style="font-size:0.78rem;font-weight:700">
                  Dueño
                </span>
                <span class="d-block"
                      style="font-size:0.7rem;color:var(--vc-text-muted)">
                  Rosario Ccallo
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Layout de dos paneles */
    .login-wrapper {
      background-color: var(--vc-bg);
    }

    /* Panel izquierdo */
    .login-panel-left {
      width: 48%;
      min-width: 400px;
      background-color: var(--vc-primary-lt);
      border-right: 1px solid var(--vc-border);
      position: relative;
      overflow: hidden;
    }

    .login-logo-mark {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background-color: var(--vc-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.4rem;
    }

    .login-brand {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--vc-text);
      margin: 0;
    }

    .login-brand-sub {
      font-size: 0.88rem;
      color: var(--vc-text-muted);
      margin: 0;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* Placeholder de imagen */
    .login-img-placeholder {
      text-align: center;
    }

    .login-img {
      width: 100%;
      max-width: 380px;
      border-radius: 16px;
      border: 1px solid var(--vc-border);
      box-shadow: 0 8px 32px rgba(90,70,60,0.10);
      display: block;
      margin: 0 auto 1rem;
    }

    .login-img-caption {
      font-size: 0.88rem;
      color: var(--vc-text-muted);
      font-style: italic;
      margin: 0;
      padding: 0 1rem;
      line-height: 1.5;
    }

    /* Puntos decorativos */
    .login-dots {
      display: flex;
      gap: 6px;
    }
    .login-dots span {
      display: block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--vc-primary);
      opacity: 0.4;
    }
    .login-dots span:first-child { opacity: 1; }

    /* Panel derecho */
    .login-panel-right {
      flex: 1;
      background-color: var(--vc-surface);
    }

    .login-form-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.7rem;
      font-weight: 700;
      color: var(--vc-text);
      margin-bottom: 0.25rem;
    }

    .login-form-sub {
      font-size: 0.88rem;
      color: var(--vc-text-muted);
    }

    /* Divisor con texto */
    .login-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 1.5rem 0 0;
      color: var(--vc-text-muted);
      font-size: 0.78rem;
    }
    .login-divider::before,
    .login-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background-color: var(--vc-border);
    }

    /* Botones de demo */
    .btn-demo {
      background-color: var(--vc-bg);
      border: 1px solid var(--vc-border);
      border-radius: 10px;
      padding: 0.75rem 0.5rem;
      text-align: center;
      transition: all 0.2s;
      color: var(--vc-text);
    }
    .btn-demo:hover {
      border-color: var(--vc-primary);
      background-color: var(--vc-primary-lt);
      color: var(--vc-text);
    }

    /* Notificación pill debajo de la imagen */
    .login-notif {
      display: flex;
      align-items: center;
      gap: 10px;
      background-color: #fff;
      border: 1px solid var(--vc-border);
      border-radius: 40px;
      padding: 0.55rem 1rem;
      margin-top: 1rem;
      box-shadow: 0 2px 10px rgba(90,70,60,0.07);
      max-width: 360px;
      margin-left: auto;
      margin-right: auto;
    }

    .login-notif-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background-color: var(--vc-primary);
      flex-shrink: 0;
      box-shadow: 0 0 0 3px var(--vc-primary-lt);
    }

    .login-notif-text {
      margin: 0;
      font-size: 0.78rem;
      color: var(--vc-text-muted);
      line-height: 1.3;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  cargando = false;
  errorLogin = '';
  mostrarPass = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email:      ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(4)]]
    });
    if (this.authService.usuarioActual) {
      this.router.navigate(['/dashboard']);
    }
  }

  invalid(campo: string): boolean {
    const c = this.loginForm.get(campo);
    return !!(c?.invalid && (c?.dirty || c?.touched));
  }

  usarCredencial(email: string, contrasena: string): void {
    this.loginForm.patchValue({ email, contrasena });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.cargando = true;
    this.errorLogin = '';
    const { email, contrasena } = this.loginForm.value;
    setTimeout(() => {
      const ok = this.authService.login(email, contrasena);
      if (ok) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorLogin = 'Credenciales incorrectas. Intenta de nuevo.';
        this.cargando = false;
      }
    }, 800);
  }
}
