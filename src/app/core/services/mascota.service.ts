import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Mascota, IMascota, Especie, EstadoSalud, Sexo, FiltroBusqueda } from '../models/mascota.model';

// =============================================================
// SERVICIO: MascotaService
// Los servicios en Angular centralizan la lógica de negocio.
// Con @Injectable({providedIn: 'root'}) Angular lo hace disponible
// en toda la app sin necesidad de declararlo en cada módulo.
// Usamos BehaviorSubject para que los componentes puedan
// "suscribirse" y recibir actualizaciones automáticas.
// =============================================================

@Injectable({
  providedIn: 'root'
})
export class MascotaService {

  // BehaviorSubject: guarda el estado actual Y emite cambios a suscriptores
  private mascotasSubject = new BehaviorSubject<Mascota[]>(this.cargarDatosMock());

  // Observable público: los componentes solo pueden LEER, no modificar directamente
  mascotas$: Observable<Mascota[]> = this.mascotasSubject.asObservable();

  // ---- CRUD tipado ----

  obtenerTodas(): Mascota[] {
    return this.mascotasSubject.getValue();
  }

  obtenerPorId(id: string): Mascota | undefined {
    return this.obtenerTodas().find(m => m.id === id);
  }

  obtenerPorDueno(idDueno: string): Mascota[] {
    return this.obtenerTodas().filter(m => m.idDueno === idDueno);
  }

  // Función genérica de búsqueda usando tipo union FiltroBusqueda
  buscar(termino: string, filtro: FiltroBusqueda = 'nombre'): Observable<Mascota[]> {
    return this.mascotas$.pipe(
      map(mascotas => mascotas.filter(m => {
        const terminoLower = termino.toLowerCase();
        switch (filtro) {
          case 'nombre':    return m.nombre.toLowerCase().includes(terminoLower);
          case 'especie':   return m.especie.toLowerCase().includes(terminoLower);
          case 'raza':      return m.raza.toLowerCase().includes(terminoLower);
          default:          return true;
        }
      }))
    );
  }

  agregar(datos: Omit<IMascota, 'id' | 'fechaRegistro'>): Mascota {
    const nueva = new Mascota({
      ...datos,
      id: this.generarId(),
      fechaRegistro: new Date()
    });
    const actuales = this.obtenerTodas();
    this.mascotasSubject.next([...actuales, nueva]);
    this.guardarEnLocalStorage();
    return nueva;
  }

  actualizar(id: string, datos: Partial<IMascota>): boolean {
    const mascotas = this.obtenerTodas();
    const index = mascotas.findIndex(m => m.id === id);
    if (index === -1) return false;

    const actualizada = new Mascota({ ...mascotas[index].toJSON(), ...datos });
    mascotas[index] = actualizada;
    this.mascotasSubject.next([...mascotas]);
    this.guardarEnLocalStorage();
    return true;
  }

  eliminar(id: string): boolean {
    const mascotas = this.obtenerTodas().filter(m => m.id !== id);
    this.mascotasSubject.next(mascotas);
    this.guardarEnLocalStorage();
    return true;
  }

  // Genera un ID único basado en timestamp + random
  private generarId(): string {
    return `MSC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private guardarEnLocalStorage(): void {
    const datos = this.obtenerTodas().map(m => m.toJSON());
    localStorage.setItem('mascotas', JSON.stringify(datos));
  }

  // Carga datos de ejemplo para demostrar la app
  private cargarDatosMock(): Mascota[] {
    const guardados = localStorage.getItem('mascotas');
    if (guardados) {
      const parsed: IMascota[] = JSON.parse(guardados);
      return parsed.map(d => new Mascota({ ...d, fechaRegistro: new Date(d.fechaRegistro) }));
    }

    return [
      new Mascota({
        id: 'MSC-001', nombre: 'Manchita', especie: Especie.PERRO, raza: 'Mestizo Serrano',
        edad: 3, peso: 14.2, sexo: Sexo.HEMBRA, idDueno: 'DUE-001',
        estadoSalud: EstadoSalud.SALUDABLE, fechaRegistro: new Date('2024-01-15')
      }),
      new Mascota({
        id: 'MSC-002', nombre: 'Misifú', especie: Especie.GATO, raza: 'Mestizo',
        edad: 5, peso: 3.9, sexo: Sexo.MACHO, idDueno: 'DUE-002',
        estadoSalud: EstadoSalud.EN_TRATAMIENTO, fechaRegistro: new Date('2024-02-20')
      }),
      new Mascota({
        id: 'MSC-003', nombre: 'Trueno', especie: Especie.PERRO, raza: 'Pastor Andino',
        edad: 2, peso: 18.5, sexo: Sexo.MACHO, idDueno: 'DUE-001',
        estadoSalud: EstadoSalud.SALUDABLE, fechaRegistro: new Date('2024-03-10')
      }),
      new Mascota({
        id: 'MSC-004', nombre: 'Chaska', especie: Especie.GATO, raza: 'Mestizo',
        edad: 7, peso: 4.1, sexo: Sexo.HEMBRA, idDueno: 'DUE-003',
        estadoSalud: EstadoSalud.EN_OBSERVACION, fechaRegistro: new Date('2024-04-05')
      }),
      new Mascota({
        id: 'MSC-005', nombre: 'Chasqui', especie: Especie.AVE, raza: 'Canario Criollo',
        edad: 1, peso: 0.02, sexo: Sexo.MACHO, idDueno: 'DUE-002',
        estadoSalud: EstadoSalud.SALUDABLE, fechaRegistro: new Date('2024-05-01')
      }),
    ];
  }
}
