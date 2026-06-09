import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DuenoMascota, Veterinario } from '../models/usuario.model';

// =============================================================
// SERVICIO: AuthService
// Simula autenticación y gestión de sesión
// =============================================================

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usuarioActualSubject = new BehaviorSubject<DuenoMascota | Veterinario | null>(null);
  usuarioActual$: Observable<DuenoMascota | Veterinario | null> = this.usuarioActualSubject.asObservable();

  estaAutenticado$: Observable<boolean> = this.usuarioActual$.pipe(
    map(u => u !== null)
  );

  constructor() {
    // Recuperar sesión guardada
    const sesion = localStorage.getItem('sesion_usuario');
    if (sesion) {
      const datos = JSON.parse(sesion);
      if (datos.rol === 'Veterinario') {
        this.usuarioActualSubject.next(
          new Veterinario(datos.id, datos.nombre, datos.email, datos.telefono, datos.especialidad, datos.licencia)
        );
      } else {
        this.usuarioActualSubject.next(
          new DuenoMascota(datos.id, datos.nombre, datos.email, datos.telefono, datos.direccion)
        );
      }
    }
  }

  get usuarioActual(): DuenoMascota | Veterinario | null {
    return this.usuarioActualSubject.getValue();
  }

  // Simula login (en producción iría a un backend)
  login(email: string, contrasena: string): boolean {
    const usuariosMock = [
      { email: 'vet@clinica.com', contrasena: '1234', rol: 'Veterinario',
        datos: new Veterinario('VET-001', 'Dr. Hernán Quispe Villanueva', 'vet@clinica.com', '944-112-338', 'Medicina General', 'MV-20481') },
      { email: 'dueno@gmail.com', contrasena: '1234', rol: 'Dueno',
        datos: new DuenoMascota('DUE-001', 'Rosario Ccallo Mamani', 'dueno@gmail.com', '961-447-820', 'Jr. Mariscal Castilla 348') }
    ];

    const encontrado = usuariosMock.find(u => u.email === email && u.contrasena === contrasena);
    if (encontrado) {
      this.usuarioActualSubject.next(encontrado.datos);
      localStorage.setItem('sesion_usuario', JSON.stringify(encontrado.datos.toJSON()));
      return true;
    }
    return false;
  }

  logout(): void {
    this.usuarioActualSubject.next(null);
    localStorage.removeItem('sesion_usuario');
  }

  esVeterinario(): boolean {
    return this.usuarioActual instanceof Veterinario;
  }
}

// =============================================================
// SERVICIO: DuenoService
// =============================================================

@Injectable({ providedIn: 'root' })
export class DuenoService {
  private duenosSubject = new BehaviorSubject<DuenoMascota[]>([
    new DuenoMascota('DUE-001', 'Rosario Ccallo Mamani', 'rosario.ccallo@gmail.com', '961-447-820', 'Jr. Mariscal Castilla 348, Cusco'),
    new DuenoMascota('DUE-002', 'Waldo Huamán Ticona', 'waldo.huaman@gmail.com', '952-663-015', 'Av. Los Incas 712, Arequipa'),
    new DuenoMascota('DUE-003', 'Flor de María Condori Apaza', 'flor.condori@gmail.com', '978-231-649', 'Calle Pachacútec 155, Puno'),
  ]);

  duenos$: Observable<DuenoMascota[]> = this.duenosSubject.asObservable();

  obtenerTodos(): DuenoMascota[] {
    return this.duenosSubject.getValue();
  }

  obtenerPorId(id: string): DuenoMascota | undefined {
    return this.obtenerTodos().find(d => d.id === id);
  }

  agregar(nombre: string, email: string, telefono: string, direccion: string): DuenoMascota {
    const nuevo = new DuenoMascota(`DUE-${Date.now()}`, nombre, email, telefono, direccion);
    this.duenosSubject.next([...this.obtenerTodos(), nuevo]);
    return nuevo;
  }
}

// =============================================================
// SERVICIO: VeterinarioService
// =============================================================

@Injectable({ providedIn: 'root' })
export class VeterinarioService {
  private veterinariosSubject = new BehaviorSubject<Veterinario[]>([
    new Veterinario('VET-001', 'Dr. Hernán Quispe Villanueva', 'hernan.quispe@clinica.com', '944-112-338', 'Medicina General', 'MV-20481'),
    new Veterinario('VET-002', 'Dra. Milagros Tapia Rondón', 'milagros.tapia@clinica.com', '935-774-206', 'Cirugía y Traumatología', 'MV-38812'),
  ]);

  veterinarios$: Observable<Veterinario[]> = this.veterinariosSubject.asObservable();

  obtenerTodos(): Veterinario[] {
    return this.veterinariosSubject.getValue();
  }

  obtenerPorId(id: string): Veterinario | undefined {
    return this.obtenerTodos().find(v => v.id === id);
  }
}
