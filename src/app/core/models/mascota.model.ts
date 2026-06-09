// =============================================================
// ENUM: Especie
// Un enum es una forma de agrupar valores fijos con nombre.
// En vez de escribir el string "Perro" por todas partes,
// usamos Especie.PERRO → más seguro y fácil de mantener.
// =============================================================

export enum Especie {
  PERRO = 'Perro',
  GATO = 'Gato',
  AVE = 'Ave',
  CONEJO = 'Conejo',
  REPTIL = 'Reptil',
  OTRO = 'Otro'
}

export enum Sexo {
  MACHO = 'Macho',
  HEMBRA = 'Hembra'
}

export enum EstadoSalud {
  SALUDABLE = 'Saludable',
  EN_TRATAMIENTO = 'En tratamiento',
  CRITICO = 'Crítico',
  EN_OBSERVACION = 'En observación'
}

// =============================================================
// INTERFAZ: IMascota
// Define qué propiedades DEBE tener cualquier objeto mascota.
// La clase Mascota luego implementa esta interfaz.
// =============================================================

export interface IMascota {
  id: string;
  nombre: string;
  especie: Especie;
  raza: string;
  edad: number;
  peso: number;
  sexo: Sexo;
  idDueno: string;
  estadoSalud: EstadoSalud;
  fechaRegistro: Date;
  fotografia?: string; // el ? significa que es opcional
}

// =============================================================
// TIPO UNION: usado para filtros y búsquedas
// Un tipo unión permite que una variable sea de varios tipos
// Por ejemplo: filtro puede ser 'nombre' O 'especie' O 'raza'
// =============================================================

export type FiltroBusqueda = 'nombre' | 'especie' | 'raza' | 'dueno';

// =============================================================
// CLASE: Mascota
// Implementa la interfaz IMascota y agrega lógica de negocio
// =============================================================

export class Mascota implements IMascota {
  id: string;
  nombre: string;
  especie: Especie;
  raza: string;
  private _edad: number;  // edad en años, con validación
  private _peso: number;  // peso en kg, con validación
  sexo: Sexo;
  idDueno: string;
  estadoSalud: EstadoSalud;
  fechaRegistro: Date;
  fotografia?: string;

  constructor(data: IMascota) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.especie = data.especie;
    this.raza = data.raza;
    this._edad = data.edad;
    this._peso = data.peso;
    this.sexo = data.sexo;
    this.idDueno = data.idDueno;
    this.estadoSalud = data.estadoSalud;
    this.fechaRegistro = data.fechaRegistro;
    this.fotografia = data.fotografia;
  }

  get edad(): number { return this._edad; }
  get peso(): number { return this._peso; }

  set edad(value: number) {
    if (value < 0 || value > 50) throw new Error('Edad inválida');
    this._edad = value;
  }

  set peso(value: number) {
    if (value <= 0 || value > 500) throw new Error('Peso inválido');
    this._peso = value;
  }

  // Método que clasifica la edad de la mascota
  obtenerEtapaVida(): string {
    if (this._edad < 1) return 'Cachorro/Cría';
    if (this._edad < 3) return 'Joven';
    if (this._edad < 8) return 'Adulto';
    return 'Senior';
  }

  estaEnTratamiento(): boolean {
    return this.estadoSalud === EstadoSalud.EN_TRATAMIENTO
      || this.estadoSalud === EstadoSalud.CRITICO;
  }

  toJSON(): IMascota {
    return {
      id: this.id,
      nombre: this.nombre,
      especie: this.especie,
      raza: this.raza,
      edad: this._edad,
      peso: this._peso,
      sexo: this.sexo,
      idDueno: this.idDueno,
      estadoSalud: this.estadoSalud,
      fechaRegistro: this.fechaRegistro,
      fotografia: this.fotografia
    };
  }
}
