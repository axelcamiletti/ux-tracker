import { Component, ViewChild, ElementRef, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { SafeUrlPipe } from '../../../../../pipes/safe-url.pipe';
import { CommonModule } from '@angular/common';
import { EventsTrackingService } from '../../../services/events-tracking.service';

// Interfaz para eventos de Figma
export interface FigmaEvent {
  type: string;
  node_id?: string;
  [key: string]: any;
}

// Interfaz para eventos de Figma con timestamp
export interface FigmaEventWithTimestamp extends FigmaEvent {
  timestamp: Date;
}

@Component({
  selector: 'app-prototype-iframe-preview',
  standalone: true,
  imports: [SafeUrlPipe, CommonModule],
  templateUrl: './prototype-iframe-preview.component.html',
  styleUrl: './prototype-iframe-preview.component.css'
})
export class PrototypeIframePreviewComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('iframePrototype') iframePrototype!: ElementRef<HTMLIFrameElement>;
  @Input() embedUrl = '';
  @Input() targetNodeId?: string;
  @Output() missionCompleted = new EventEmitter<boolean>();
  @Output() figmaEvent = new EventEmitter<FigmaEventWithTimestamp>();
  @Output() eventsHistoryRequested = new EventEmitter<FigmaEventWithTimestamp[]>();

  missionCompletedState = false;
  private eventListener: ((event: MessageEvent) => void) | null = null;
  private hasReachedTarget = false;
  // Almacena todos los eventos con timestamp para acceso posterior
  private eventsHistory: FigmaEventWithTimestamp[] = [];

  constructor(private eventsTrackingService: EventsTrackingService) {}

  ngAfterViewInit(): void {
    this.setupEventListener();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['embedUrl'] && this.iframePrototype?.nativeElement) {
      this.setupEventListener();
    }
  }

  ngOnDestroy(): void {
    this.removeEventListener();
  }

  /**
   * Obtiene el historial completo de eventos capturados
   * @returns Arreglo de eventos de Figma con timestamp
   */
  public getEventsHistory(): FigmaEventWithTimestamp[] {
    return [...this.eventsHistory]; // Devuelve una copia para evitar modificaciones externas
  }

  /**
   * Solicita el historial de eventos y lo emite a través del EventEmitter
   */
  public requestEventsHistory(): void {
    this.eventsHistoryRequested.emit(this.getEventsHistory());
  }

  private setupEventListener(): void {
    this.removeEventListener();

    // Crear un nuevo listener para eventos de Figma
    this.eventListener = (event: MessageEvent) => {
      // Verificar que el mensaje viene de Figma
      if (event.origin.includes('figma.com')) {
        try {
          const figmaEvent = event.data as FigmaEvent;
          // Procesar el evento
          this.processPrototypeEvent(figmaEvent);
        } catch (error) {
          console.error('Error procesando evento de Figma:', error);
        }
      }
    };

    // Añadir listener
    window.addEventListener('message', this.eventListener);
  }

  private removeEventListener(): void {
    if (this.eventListener) {
      window.removeEventListener('message', this.eventListener);
      this.eventListener = null;
    }
  }

  // Procesar eventos del prototipo
  private processPrototypeEvent(event: FigmaEvent): void {
    // Crear un objeto de evento con marca de tiempo
    const eventWithTimestamp: FigmaEventWithTimestamp = {
      timestamp: new Date(),
      ...event
    };
    console.log('🔍 Evento de Figma procesado:', eventWithTimestamp);

    // Añadir evento al historial local
    this.eventsHistory.push(eventWithTimestamp);

    // Registrar el evento en el servicio central
    this.eventsTrackingService.registerEvent(eventWithTimestamp);

    // Emitir el evento para guardarlo
    this.figmaEvent.emit(eventWithTimestamp);

    // Verificar si hemos llegado a la pantalla objetivo
    if (this.targetNodeId && event.type === 'NAVIGATE' && event.node_id === this.targetNodeId) {
      this.hasReachedTarget = true;
      this.missionCompletedState = true; // Actualizar estado para mostrar pantalla de éxito
      this.missionCompleted.emit(true);
    }
  }
}
