import { Component, Input, Output, EventEmitter, SimpleChanges, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PrototypeTestSection, FigmaUrl } from '../../../models/section.model';
import { PrototypeTestResponse } from '../../../models/study-response.model';
import { StudyStateService } from '../../../services/study-state.service';
import { StudyPrototypeService } from '../../../services/study-prototype.service';
import { Subject, takeUntil } from 'rxjs';

// Interfaces para el manejo de eventos de Figma
interface FigmaEvent {
  type: string;
  data: any;
}

interface FigmaMouseEvent {
  point: { x: number; y: number };
  button: number; // 0 = left, 1 = middle, 2 = right
  state: 'down' | 'up';
  elementId?: string;
  frameId?: string; // Nuevo campo para identificar en qué frame ocurre la interacción
}

interface FigmaNavigationEvent {
  fromNodeId: string;
  fromNodeName?: string;
  toNodeId: string;
  toNodeName?: string;
}

interface FigmaStateChangeEvent {
  componentId: string;
  componentName?: string;
  stateId: string;
  stateName: string;
}

@Component({
  selector: 'app-prototype-test-preview',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './prototype-test-preview.component.html',
  styleUrl: './prototype-test-preview.component.css'
})
export class PrototypeTestPreviewComponent implements OnInit, OnDestroy {
  @Input() section!: PrototypeTestSection;
  @Output() responseChange = new EventEmitter<PrototypeTestResponse>();
  @ViewChild('iframePrototype') iframePrototype!: ElementRef<HTMLIFrameElement>;
  private listener = this.handleMessage.bind(this);

  private destroy$ = new Subject<void>();
  private urlRegex = /^https:\/\/www\.figma\.com\/(proto|file)\/([a-zA-Z0-9]+)\/([^?]+)\?.*(?:node-id=([^&]+)).*(?:starting-point-node-id=([^&]+))?/;

  isIframeLoading = true;
  showIframe = true;
  showPreview = false;

  // Datos para el seguimiento de interacciones con el prototipo
  prototypeInteractions = {
    clickEvents: [] as Array<{
      x: number;
      y: number;
      elementId: string | null;
      frameId: string | null;
      eventType: 'press' | 'release';
      timestamp: Date
    }>,
    navigationEvents: [] as Array<{ from: string; to: string; timestamp: Date }>,
    stateChangeEvents: [] as Array<{ componentId: string; state: string; timestamp: Date }>,

    currentScreen: '',
    currentFrameId: '',
    screenTimes: {} as { [key: string]: { enterTime: Date; exitTime?: Date } },
    startTime: new Date()
  };

  previewData = {
    title: '',
    description: '',
    prototypeUrl: '' as string | SafeResourceUrl,
    figmaUrl: null as FigmaUrl | null,
    instructions: '',
    timeLimit: undefined as number | undefined,
    interactionTracking: {
      enabled: false,
      trackClicks: false,
      trackMouseMovement: false,
      trackScrolling: false,
      trackKeyboard: false,
      elements: [] as { selector: string; name: string }[]
    }
  };

  // Nueva propiedad para controlar la visibilidad del panel de estadísticas
  showStatsBox = true;

  constructor(
    private studyState: StudyStateService,
    private studyPrototype: StudyPrototypeService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.studyState.prototypeTestSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        if (section) {
          this.updatePreviewData(section);
          this.showPreview = section.data.showPreview ?? false;

          // Establecer la sección activa en el servicio de prototipo
          this.studyPrototype.setActiveSectionId(section.id);
        }
      });

    // Inicializamos el registro de interacciones
    this.prototypeInteractions.startTime = new Date();
    window.addEventListener('message', this.listener, false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('message', this.listener, false);
  }

  private handleMessage(event: MessageEvent) {
    const FIGMA_ORIGIN = 'https://www.figma.com';
    const iframeWin = this.iframePrototype.nativeElement.contentWindow;

    // 1) Sólo del iframe que esperamos
    if (event.source !== iframeWin) {
      return;
    }

    // 2) Sólo el origen oficial de Figma
    if (event.origin !== FIGMA_ORIGIN) {
      // opcional: elimina el console.warn para no ver mensajes internos
      return;
    }

    // 3) Sólo los tipos de evento del Embed Kit
    const tipo = event.data?.type;
    const protEvents = [
      'INITIAL_LOAD',
      'MOUSE_PRESS_OR_RELEASE',
      'PRESENTED_NODE_CHANGED',
      'NEW_STATE',
      'REQUEST_CLOSE'
    ];
    if (!protEvents.includes(tipo)) {
      return;
    }

    // --- aquí procesas event.data como antes ---
    console.log('Evento Figma válido:', event.data);

    // Registrar el evento en el servicio de prototipo
    this.studyPrototype.handleFigmaEvent(event.data);

    // Actualizar nuestros datos locales para el box flotante
    this.updateLocalInteractionData(event.data);
  }

  private updateLocalInteractionData(eventData: any): void {
    const timestamp = new Date();

    switch (eventData.type) {
      case 'INITIAL_LOAD':
        // Registrar la pantalla inicial
        const nodeName = eventData.node_name || 'Pantalla inicial';
        this.prototypeInteractions.currentScreen = nodeName;
        this.prototypeInteractions.currentFrameId = eventData.node_id || '';

        // Iniciar el tiempo para esta pantalla
        if (!this.prototypeInteractions.screenTimes[nodeName]) {
          this.prototypeInteractions.screenTimes[nodeName] = {
            enterTime: timestamp
          };
        }
        break;

      case 'PRESENTED_NODE_CHANGED':
        // Registrar el cambio de pantalla
        const prevScreen = this.prototypeInteractions.currentScreen;
        const newScreen = eventData.node_name || eventData.node_id || 'Pantalla desconocida';

        // Cerrar el tiempo de la pantalla anterior
        if (prevScreen && this.prototypeInteractions.screenTimes[prevScreen]) {
          this.prototypeInteractions.screenTimes[prevScreen].exitTime = timestamp;
        }

        // Iniciar el tiempo para la nueva pantalla
        this.prototypeInteractions.currentScreen = newScreen;
        this.prototypeInteractions.currentFrameId = eventData.node_id || '';
        if (!this.prototypeInteractions.screenTimes[newScreen]) {
          this.prototypeInteractions.screenTimes[newScreen] = {
            enterTime: timestamp
          };
        }

        // Registrar el evento de navegación
        this.prototypeInteractions.navigationEvents.push({
          from: prevScreen,
          to: newScreen,
          timestamp: timestamp
        });
        break;

      case 'MOUSE_PRESS_OR_RELEASE':
        // Registrar clicks
        this.prototypeInteractions.clickEvents.push({
          x: eventData.point?.x || 0,
          y: eventData.point?.y || 0,
          elementId: eventData.element_id || null,
          frameId: this.prototypeInteractions.currentFrameId,
          eventType: eventData.state === 'down' ? 'press' : 'release',
          timestamp: timestamp
        });
        break;

      case 'NEW_STATE':
        // Registrar cambios de estado
        this.prototypeInteractions.stateChangeEvents.push({
          componentId: eventData.component_id || eventData.component_name || 'Componente desconocido',
          state: eventData.state_name || eventData.state_id || 'Estado desconocido',
          timestamp: timestamp
        });
        break;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.updatePreviewData(this.section);
      this.studyState.setPrototypeTestSection(this.section);
    }
  }

  onIframeLoad() {
    console.log('Iframe loaded successfully');
    console.log('Iframe URL:', this.previewData.prototypeUrl);
    this.isIframeLoading = false;

    // Una vez que el iframe se carga, habilitamos el seguimiento de interacciones
    if (this.section.data.interactionTracking?.enabled) {
      this.previewData.interactionTracking.enabled = true;
    }
  }

  loadPrototype() {
    this.showIframe = true;
    this.isIframeLoading = true;
  }

  private updatePreviewData(section: PrototypeTestSection) {
    this.isIframeLoading = true;
    this.showIframe = false;

    let figmaUrl: FigmaUrl | null = null;
    let embedUrl = '';

    if (section.data.prototypeUrl) {
      const match = section.data.prototypeUrl.match(this.urlRegex);
      if (match) {
        figmaUrl = {
          fileType: match[1],
          fileKey: match[2],
          fileName: decodeURIComponent(match[3]),
          nodeId: match[4],
          startingNodeId: match[5] || match[4]
        };

        // Modificamos la URL para incluir parámetros que permiten el envío de eventos de Figma
        embedUrl = `https://embed.figma.com/${figmaUrl.fileType}/${figmaUrl.fileKey}/${figmaUrl.fileName}?node-id=${figmaUrl.startingNodeId}&embed-host=share&footer=false&viewport-controls=false&allow-external-events=true&client-id=fV57d1E9E5FCZ1d1hKVS3e`;
      }
    }

    this.previewData = {
      title: section.title || '',
      description: section.description || '',
      prototypeUrl: embedUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl) : '',
      figmaUrl: figmaUrl,
      instructions: section.data.instructions || '',
      timeLimit: section.data.timeLimit,
      interactionTracking: {
        enabled: section.data.interactionTracking?.enabled || false,
        trackClicks: section.data.interactionTracking?.trackClicks || false,
        trackMouseMovement: section.data.interactionTracking?.trackMouseMovement || false,
        trackScrolling: section.data.interactionTracking?.trackScrolling || false,
        trackKeyboard: section.data.interactionTracking?.trackKeyboard || false,
        elements: (section.data.interactionTracking?.elements || []).map(e => ({
          selector: e.selector,
          name: e.description
        }))
      }
    };
  }
  onTestComplete(timeSpent: number, interactions?: Array<any>) {
    // Obtener la respuesta completa desde el servicio, que incluye todos los eventos capturados
    const completeResponse = this.studyPrototype.createSummaryResponse(this.section.id);

    // También emitir la respuesta para mantener la compatibilidad con el flujo existente
    this.responseChange.emit(completeResponse);

    console.log('Test completado. Resumen de interacciones:', completeResponse);
  }

  // Método para alternar la visibilidad del panel de estadísticas
  toggleStatsBox(): void {
    this.showStatsBox = !this.showStatsBox;
  }

  // Obtener entradas de tiempo por pantalla para mostrar en el box flotante
  getScreenTimeEntries(): Array<{ name: string; timeSpent: number }> {
    const result: Array<{ name: string; timeSpent: number }> = [];

    // Procesamos cada entrada de screenTimes
    for (const [name, timeData] of Object.entries(this.prototypeInteractions.screenTimes)) {
      // Si no hay tiempo de salida, usamos la hora actual para pantalla actual
      const exitTime = timeData.exitTime || new Date();
      const timeSpent = exitTime.getTime() - timeData.enterTime.getTime();

      result.push({
        name,
        timeSpent
      });
    }

    // Ordenamos por tiempo (descendente)
    return result.sort((a, b) => b.timeSpent - a.timeSpent);
  }

  // Calcular tiempo total de la prueba
  getTotalTimeSpent(): number {
    return new Date().getTime() - this.prototypeInteractions.startTime.getTime();
  }

  // Dar formato a un timestamp para mostrar
  formatTimestamp(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  // Dar formato al tiempo transcurrido
  formatTimeSpent(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  // Obtener los últimos eventos para mostrar en el panel
  getLastEvents(): Array<{ action: string; timestamp: Date }> {
    const allEvents = [
      ...this.prototypeInteractions.clickEvents.map(event => ({
        action: `Clic en ${event.elementId || 'elemento desconocido'}`,
        timestamp: event.timestamp
      })),
      ...this.prototypeInteractions.navigationEvents.map(event => ({
        action: `Navegación de ${event.from} a ${event.to}`,
        timestamp: event.timestamp
      })),
      ...this.prototypeInteractions.stateChangeEvents.map(event => ({
        action: `Cambio de estado a ${event.state} en ${event.componentId}`,
        timestamp: event.timestamp
      }))
    ];

    // Ordenamos por timestamp (más reciente primero)
    return allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}
