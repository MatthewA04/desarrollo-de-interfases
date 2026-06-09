// =============================================================
// MODELO DE CITAS
// =============================================================

export enum EstadoCita {
  PENDIENTE = 'Pendiente',
  CONFIRMADA = 'Confirmada',
  EN_CURSO = 'En curso',
  COMPLETADA = 'Completada',
  CANCELADA = 'Cancelada'
}

export enum TipoConsulta {
  CONSULTA_GENERAL = 'Consulta general',
  VACUNACION = 'Vacunación',
  CIRUGIA = 'Cirugía',
  EMERGENCIA = 'Emergencia',
  CONTROL = 'Control',
  GROOMING = 'Grooming'
}

// Interfaz para el modelo de cita
export interface ICita {
  id: string;
  idMascota: string;
  idVeterinario: string;
  idDueno: string;
  fecha: Date;
  hora: string;         // "HH:mm"
  duracionMinutos: number;
  tipoConsulta: TipoConsulta;
  estado: EstadoCita;
  motivoConsulta: string;
  notas?: string;
  fechaCreacion: Date;
}

// Interfaz para el historial de atención dentro de una cita completada
export interface IRegistroAtencion {
  id: string;
  idCita: string;
  idMascota: string;
  diagnostico: string;
  tratamiento: string;
  medicamentos: IMedicamento[];
  pesoEnConsulta: number;
  proximaVisita?: Date;
  observaciones?: string;
  fechaAtencion: Date;
}

export interface IMedicamento {
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracionDias: number;
}

// =============================================================
// CLASE: Cita
// Contiene lógica como saber si ya pasó o está próxima
// =============================================================

export class Cita implements ICita {
  id!: string;
  idMascota!: string;
  idVeterinario!: string;
  idDueno!: string;
  fecha!: Date;
  hora!: string;
  duracionMinutos!: number;
  tipoConsulta!: TipoConsulta;
  estado!: EstadoCita;
  motivoConsulta!: string;
  notas?: string;
  fechaCreacion!: Date;

  constructor(data: ICita) {
    Object.assign(this, data);
    this.fecha = new Date(data.fecha);
    this.fechaCreacion = new Date(data.fechaCreacion);
  }

  // Devuelve true si la cita es dentro de las próximas 24 horas
  esProxima(): boolean {
    const ahora = new Date();
    const diferencia = this.fecha.getTime() - ahora.getTime();
    const horasRestantes = diferencia / (1000 * 60 * 60);
    return horasRestantes >= 0 && horasRestantes <= 24;
  }

  // Devuelve true si la cita ya pasó
  estaPasada(): boolean {
    return new Date() > this.fecha
      && this.estado !== EstadoCita.EN_CURSO;
  }

  // Obtiene el color de badge según el estado
  obtenerColorEstado(): string {
    const colores: Record<EstadoCita, string> = {
      [EstadoCita.PENDIENTE]: 'warning',
      [EstadoCita.CONFIRMADA]: 'info',
      [EstadoCita.EN_CURSO]: 'primary',
      [EstadoCita.COMPLETADA]: 'success',
      [EstadoCita.CANCELADA]: 'danger'
    };
    return colores[this.estado];
  }

  // Cambia el estado con validación de transiciones permitidas
  cambiarEstado(nuevoEstado: EstadoCita): void {
    const transicionesValidas: Partial<Record<EstadoCita, EstadoCita[]>> = {
      [EstadoCita.PENDIENTE]: [EstadoCita.CONFIRMADA, EstadoCita.CANCELADA],
      [EstadoCita.CONFIRMADA]: [EstadoCita.EN_CURSO, EstadoCita.CANCELADA],
      [EstadoCita.EN_CURSO]: [EstadoCita.COMPLETADA]
    };

    const permitidos = transicionesValidas[this.estado];
    if (!permitidos || !permitidos.includes(nuevoEstado)) {
      throw new Error(`No se puede cambiar de ${this.estado} a ${nuevoEstado}`);
    }
    this.estado = nuevoEstado;
  }
}
