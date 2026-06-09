import { Pipe, PipeTransform } from '@angular/core';
import { EstadoCita } from '../../core/models/cita.model';
import { EstadoSalud } from '../../core/models/mascota.model';

// =============================================================
// PIPE PERSONALIZADO: FechaCitaPipe
// Transforma una fecha en texto legible ("Hoy", "Mañana", etc.)
// Uso en HTML: {{ cita.fecha | fechaCita:'relativo' }}
// =============================================================
@Pipe({ name: 'fechaCita', standalone: true })
export class FechaCitaPipe implements PipeTransform {
  transform(fecha: Date | string, formato: 'corto' | 'largo' | 'relativo' = 'corto'): string {
    if (!fecha) return 'Sin fecha';
    const fechaObj = new Date(fecha);
    const hoy     = new Date();
    const manana  = new Date(hoy); manana.setDate(hoy.getDate() + 1);
    const ayer    = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
    const mismo   = (a: Date, b: Date) => a.toDateString() === b.toDateString();

    if (formato === 'relativo') {
      if (mismo(fechaObj, hoy))    return 'Hoy';
      if (mismo(fechaObj, manana)) return 'Mañana';
      if (mismo(fechaObj, ayer))   return 'Ayer';
    }
    const opciones: Intl.DateTimeFormatOptions = formato === 'largo'
      ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      : { day: '2-digit', month: '2-digit', year: 'numeric' };
    return fechaObj.toLocaleDateString('es-PE', opciones);
  }
}

// =============================================================
// PIPE PERSONALIZADO: EstadoBadgePipe
// Devuelve las clases CSS de Bootstrap para colorear un badge
// Uso: {{ cita.estado | estadoBadge }}
// =============================================================
@Pipe({ name: 'estadoBadge', standalone: true })
export class EstadoBadgePipe implements PipeTransform {
  transform(estado: EstadoCita | EstadoSalud): string {
    const mapa: Record<string, string> = {
      'Pendiente':      'bg-warning text-dark',
      'Confirmada':     'bg-info text-white',
      'En curso':       'bg-primary text-white',
      'Completada':     'bg-success text-white',
      'Cancelada':      'bg-danger text-white',
      'Saludable':      'bg-success text-white',
      'En tratamiento': 'bg-warning text-dark',
      'Crítico':        'bg-danger text-white',
      'En observación': 'bg-info text-white'
    };
    return mapa[estado] ?? 'bg-secondary text-white';
  }
}

// =============================================================
// PIPE PERSONALIZADO: EspeciePipe
// Muestra la especie con un texto limpio (sin emojis)
// Uso: {{ mascota.especie | especieIcono }}
// =============================================================
@Pipe({ name: 'especieIcono', standalone: true })
export class EspeciePipe implements PipeTransform {
  transform(especie: string): string {
    return especie ?? 'Desconocida';
  }
}

// =============================================================
// PIPE PERSONALIZADO: EdadMascotaPipe
// Formatea la edad como "3 años" o "8 meses"
// Uso: {{ mascota.edad | edadMascota }}
// =============================================================
@Pipe({ name: 'edadMascota', standalone: true })
export class EdadMascotaPipe implements PipeTransform {
  transform(edad: number): string {
    if (edad < 1) {
      const meses = Math.round(edad * 12);
      return meses === 1 ? '1 mes' : `${meses} meses`;
    }
    return edad === 1 ? '1 año' : `${edad} años`;
  }
}
