import { Persona } from './persona.model';

// =============================================================
// INTERFAZ: define la "forma" de un objeto sin implementar lógica
// Las interfaces son contratos que las clases deben cumplir
// =============================================================

export interface IContactable {
  enviarNotificacion(mensaje: string): void;
}

// =============================================================
// CLASE: DuenoMascota
// Hereda de Persona → recibe automáticamente todos sus atributos
// y métodos. Solo agrega lo que es específico de un dueño.
// =============================================================

export class DuenoMascota extends Persona implements IContactable {
  private _direccion: string;
  private _idsMascotas: string[];  // IDs de sus mascotas registradas

  constructor(
    id: string,
    nombre: string,
    email: string,
    telefono: string,
    direccion: string
  ) {
    super(id, nombre, email, telefono); // llama al constructor del padre
    this._direccion = direccion;
    this._idsMascotas = [];
  }

  get direccion(): string { return this._direccion; }
  get idsMascotas(): string[] { return [...this._idsMascotas]; } // copia defensiva

  agregarMascota(idMascota: string): void {
    if (!this._idsMascotas.includes(idMascota)) {
      this._idsMascotas.push(idMascota);
    }
  }

  // Implementación del método abstracto (polimorfismo)
  getRol(): string {
    return 'Dueño';
  }

  // Implementación de la interfaz IContactable
  enviarNotificacion(mensaje: string): void {
    console.log(`Notificando a ${this.nombre} (${this.email}): ${mensaje}`);
  }

  override toJSON(): object {
    return {
      ...super.toJSON(),
      direccion: this._direccion,
      idsMascotas: this._idsMascotas
    };
  }
}

// =============================================================
// CLASE: Veterinario
// También hereda de Persona pero tiene datos distintos
// Mismo método getRol() con resultado diferente = polimorfismo
// =============================================================

export class Veterinario extends Persona implements IContactable {
  private _especialidad: string;
  private _licencia: string;
  private _disponible: boolean;

  constructor(
    id: string,
    nombre: string,
    email: string,
    telefono: string,
    especialidad: string,
    licencia: string
  ) {
    super(id, nombre, email, telefono);
    this._especialidad = especialidad;
    this._licencia = licencia;
    this._disponible = true;
  }

  get especialidad(): string { return this._especialidad; }
  get licencia(): string { return this._licencia; }
  get disponible(): boolean { return this._disponible; }

  cambiarDisponibilidad(estado: boolean): void {
    this._disponible = estado;
  }

  // Polimorfismo: mismo método, resultado diferente al de DuenoMascota
  getRol(): string {
    return 'Veterinario';
  }

  enviarNotificacion(mensaje: string): void {
    console.log(`Alerta para Dr. ${this.nombre}: ${mensaje}`);
  }

  override toJSON(): object {
    return {
      ...super.toJSON(),
      especialidad: this._especialidad,
      licencia: this._licencia,
      disponible: this._disponible
    };
  }
}
