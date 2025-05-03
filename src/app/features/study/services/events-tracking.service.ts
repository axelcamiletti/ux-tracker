import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FigmaEventWithTimestamp } from '../components/previews/prototype-iframe-preview/prototype-iframe-preview.component';

@Injectable({
  providedIn: 'root',
})
export class EventsTrackingService {
  // Almacena todos los eventos procesados con su timestamp
  private eventsHistory: FigmaEventWithTimestamp[] = [];

  // BehaviorSubject para emitir actualizaciones cuando se registran nuevos eventos
  private eventsHistorySubject = new BehaviorSubject<FigmaEventWithTimestamp[]>([]);

  // Observable público para que los componentes se suscriban a las actualizaciones
  public eventsHistory$: Observable<FigmaEventWithTimestamp[]> = this.eventsHistorySubject.asObservable();

  constructor() { }

  /**
   * Registra un nuevo evento en el historial
   * @param event Evento de Figma con timestamp a registrar
   */
  public registerEvent(event: FigmaEventWithTimestamp): void {
    // Añadir el evento al historial
    this.eventsHistory.push(event);

    // Notificar a todos los suscriptores sobre la actualización
    this.eventsHistorySubject.next([...this.eventsHistory]);
  }

  /**
   * Registra múltiples eventos en el historial
   * @param events Lista de eventos de Figma con timestamp a registrar
   */
  public registerEvents(events: FigmaEventWithTimestamp[]): void {
    // Añadir todos los eventos al historial
    this.eventsHistory.push(...events);

    // Notificar a todos los suscriptores sobre la actualización
    this.eventsHistorySubject.next([...this.eventsHistory]);
  }

  /**
   * Obtiene todos los eventos registrados
   * @returns Copia del array de eventos
   */
  public getEvents(): FigmaEventWithTimestamp[] {
    // Devuelve una copia para evitar modificaciones externas
    return [...this.eventsHistory];
  }

  /**
   * Limpia el historial de eventos
   */
  public clearEvents(): void {
    this.eventsHistory = [];
    this.eventsHistorySubject.next([]);
  }
}
