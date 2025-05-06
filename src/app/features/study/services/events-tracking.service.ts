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

  public registerEvent(event: FigmaEventWithTimestamp): void {
    // Añadir el evento al historial
    this.eventsHistory.push(event);

    // Notificar a todos los suscriptores sobre la actualización
    this.eventsHistorySubject.next([...this.eventsHistory]);
  }

  public registerEvents(events: FigmaEventWithTimestamp[]): void {
    // Añadir todos los eventos al historial
    this.eventsHistory.push(...events);

    // Notificar a todos los suscriptores sobre la actualización
    this.eventsHistorySubject.next([...this.eventsHistory]);
  }

  public getEvents(): FigmaEventWithTimestamp[] {
    // Devuelve una copia para evitar modificaciones externas
    return [...this.eventsHistory];
  }

  public clearEvents(): void {
    this.eventsHistory = [];
    this.eventsHistorySubject.next([]);
  }
}
