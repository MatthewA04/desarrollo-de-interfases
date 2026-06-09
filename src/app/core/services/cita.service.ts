import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cita, ICita, EstadoCita, TipoConsulta, IRegistroAtencion } from '../models/cita.model';

@Injectable({
  providedIn: 'root'
})
export class CitaService {

  private citasSubject = new BehaviorSubject<Cita[]>(this.cargarDatosMock());
  private historialSubject = new BehaviorSubject<IRegistroAtencion[]>(this.cargarHistorialMock());

  citas$: Observable<Cita[]> = this.citasSubject.asObservable();
  historial$: Observable<IRegistroAtencion[]> = this.historialSubject.asObservable();

  obtenerTodas(): Cita[] {
    return this.citasSubject.getValue();
  }

  obtenerPorId(id: string): Cita | undefined {
    return this.obtenerTodas().find(c => c.id === id);
  }

  obtenerPorMascota(idMascota: string): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => citas.filter(c => c.idMascota === idMascota))
    );
  }

  obtenerPorFecha(fecha: Date): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => citas.filter(c => {
        const f = new Date(c.fecha);
        return f.toDateString() === fecha.toDateString();
      }))
    );
  }

  obtenerProximas(): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => citas
        .filter(c => c.esProxima())
        .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
      )
    );
  }

  // Verifica si hay conflicto de horario para un veterinario
  hayConflictoHorario(idVeterinario: string, fecha: Date, hora: string, duracion: number, excluirId?: string): boolean {
    const [h, m] = hora.split(':').map(Number);
    const inicio = h * 60 + m;
    const fin = inicio + duracion;

    return this.obtenerTodas().some(c => {
      if (c.id === excluirId) return false;
      if (c.idVeterinario !== idVeterinario) return false;
      if (new Date(c.fecha).toDateString() !== fecha.toDateString()) return false;
      if (c.estado === EstadoCita.CANCELADA) return false;

      const [ch, cm] = c.hora.split(':').map(Number);
      const cInicio = ch * 60 + cm;
      const cFin = cInicio + c.duracionMinutos;

      return inicio < cFin && fin > cInicio;
    });
  }

  agregar(datos: Omit<ICita, 'id' | 'fechaCreacion'>): Cita {
    const nueva = new Cita({
      ...datos,
      id: `CIT-${Date.now()}`,
      fechaCreacion: new Date()
    });
    this.citasSubject.next([...this.obtenerTodas(), nueva]);
    this.guardarCitas();
    return nueva;
  }

  cambiarEstado(id: string, estado: EstadoCita): boolean {
    const citas = this.obtenerTodas();
    const cita = citas.find(c => c.id === id);
    if (!cita) return false;
    try {
      cita.cambiarEstado(estado);
      this.citasSubject.next([...citas]);
      this.guardarCitas();
      return true;
    } catch {
      return false;
    }
  }

  agregarRegistroAtencion(registro: Omit<IRegistroAtencion, 'id'>): IRegistroAtencion {
    const nuevo: IRegistroAtencion = {
      ...registro,
      id: `HIS-${Date.now()}`
    };
    this.historialSubject.next([...this.historialSubject.getValue(), nuevo]);
    localStorage.setItem('historial', JSON.stringify(this.historialSubject.getValue()));
    return nuevo;
  }

  obtenerHistorialPorMascota(idMascota: string): Observable<IRegistroAtencion[]> {
    return this.historial$.pipe(
      map(h => h
        .filter(r => r.idMascota === idMascota)
        .sort((a, b) => new Date(b.fechaAtencion).getTime() - new Date(a.fechaAtencion).getTime())
      )
    );
  }

  private generarId(): string {
    return `CIT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }

  private guardarCitas(): void {
    localStorage.setItem('citas', JSON.stringify(this.obtenerTodas()));
  }

  private cargarDatosMock(): Cita[] {
    const guardadas = localStorage.getItem('citas');
    if (guardadas) {
      const parsed: ICita[] = JSON.parse(guardadas);
      return parsed.map(d => new Cita({ ...d, fecha: new Date(d.fecha), fechaCreacion: new Date(d.fechaCreacion) }));
    }

    const hoy = new Date();
    const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);
    const pasado = new Date(hoy); pasado.setDate(hoy.getDate() + 2);
    const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);

    return [
      new Cita({ id: 'CIT-001', idMascota: 'MSC-001', idVeterinario: 'VET-001', idDueno: 'DUE-001',
        fecha: manana, hora: '09:00', duracionMinutos: 30, tipoConsulta: TipoConsulta.CONTROL,
        estado: EstadoCita.CONFIRMADA, motivoConsulta: 'Control anual de vacunas y desparasitación', fechaCreacion: new Date() }),
      new Cita({ id: 'CIT-002', idMascota: 'MSC-002', idVeterinario: 'VET-001', idDueno: 'DUE-002',
        fecha: hoy, hora: '11:00', duracionMinutos: 45, tipoConsulta: TipoConsulta.CONSULTA_GENERAL,
        estado: EstadoCita.EN_CURSO, motivoConsulta: 'Revisión por pérdida de apetito y decaimiento', fechaCreacion: new Date() }),
      new Cita({ id: 'CIT-003', idMascota: 'MSC-003', idVeterinario: 'VET-002', idDueno: 'DUE-001',
        fecha: pasado, hora: '15:00', duracionMinutos: 60, tipoConsulta: TipoConsulta.GROOMING,
        estado: EstadoCita.PENDIENTE, motivoConsulta: 'Baño, limpieza de orejas y revisión de pelaje', fechaCreacion: new Date() }),
      new Cita({ id: 'CIT-004', idMascota: 'MSC-001', idVeterinario: 'VET-001', idDueno: 'DUE-001',
        fecha: ayer, hora: '10:00', duracionMinutos: 30, tipoConsulta: TipoConsulta.VACUNACION,
        estado: EstadoCita.COMPLETADA, motivoConsulta: 'Vacuna antirrábica y refuerzo pentavalente', fechaCreacion: new Date() }),
    ];
  }

  private cargarHistorialMock(): IRegistroAtencion[] {
    const guardado = localStorage.getItem('historial');
    if (guardado) return JSON.parse(guardado);

    return [
      {
        id: 'HIS-001', idCita: 'CIT-004', idMascota: 'MSC-001',
        diagnostico: 'Canina en buen estado general. Vacunación y desparasitación al día.',
        tratamiento: 'Vacuna antirrábica + pentavalente aplicadas. Desparasitación interna con Drontal.',
        medicamentos: [{ nombre: 'Rabisin', dosis: '1ml', frecuencia: 'Única', duracionDias: 1 }],
        pesoEnConsulta: 28.2, fechaAtencion: new Date(Date.now() - 86400000),
        observaciones: 'Próxima vacuna en 12 meses. Mantener dieta balanceada para su peso.'
      },
      {
        id: 'HIS-002', idCita: 'CIT-OLD-1', idMascota: 'MSC-002',
        diagnostico: 'Gastroenteritis leve, posiblemente por ingesta de alimento en mal estado.',
        tratamiento: 'Dieta blanda a base de arroz cocido y pollo sin sal por 3 días.',
        medicamentos: [
          { nombre: 'Metronidazol', dosis: '125mg', frecuencia: 'Cada 12 horas', duracionDias: 7 },
          { nombre: 'Probiótico Felino', dosis: '1 sobre', frecuencia: 'Una vez al día', duracionDias: 14 }
        ],
        pesoEnConsulta: 4.0, fechaAtencion: new Date(Date.now() - 7 * 86400000),
        proximaVisita: new Date(Date.now() + 7 * 86400000)
      },
      {
        id: 'HIS-003', idCita: 'CIT-OLD-2', idMascota: 'MSC-003',
        diagnostico: 'Control de rutina. Canino activo, con buena condición corporal y pelaje espeso propio de la raza.',
        tratamiento: 'Desparasitación interna preventiva y limpieza dental básica.',
        medicamentos: [
          { nombre: 'Milbemax', dosis: '1 comprimido', frecuencia: 'Dosis única', duracionDias: 1 }
        ],
        pesoEnConsulta: 11.8, fechaAtencion: new Date(Date.now() - 14 * 86400000),
        observaciones: 'Repetir desparasitación en 3 meses. Buena adaptación al clima serrano.'
      }
    ];
  }
}
