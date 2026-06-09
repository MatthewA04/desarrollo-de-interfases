// =============================================================
// MODELO BASE: Persona (clase abstracta)
// Usamos una clase abstracta para aplicar el principio de
// herencia y encapsulamiento. No se puede instanciar directamente,
// solo sirve como "molde" para otras clases.
// =============================================================

export abstract class Persona {
  // Propiedades privadas = encapsulamiento
  // Nadie de afuera puede cambiarlas directamente
  private _id: string;
  private _nombre: string;
  private _email: string;
  private _telefono: string;

  constructor(id: string, nombre: string, email: string, telefono: string) {
    this._id = id;
    this._nombre = nombre;
    this._email = email;
    this._telefono = telefono;
  }

  // Getters: permiten leer las propiedades privadas desde afuera
  get id(): string { return this._id; }
  get nombre(): string { return this._nombre; }
  get email(): string { return this._email; }
  get telefono(): string { return this._telefono; }

  // Setters con validación = encapsulamiento con control
  set nombre(value: string) {
    if (!value || value.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }
    this._nombre = value.trim();
  }

  set email(value: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Email inválido');
    }
    this._email = value;
  }

  // Método abstracto: cada clase hija DEBE implementarlo (polimorfismo)
  abstract getRol(): string;

  // Método común heredado por todos
  obtenerInfo(): string {
    return `${this.getRol()}: ${this._nombre} | ${this._email}`;
  }

  // Convierte la clase a un objeto plano para guardar/mostrar
  toJSON(): object {
    return {
      id: this._id,
      nombre: this._nombre,
      email: this._email,
      telefono: this._telefono,
      rol: this.getRol()
    };
  }
}
