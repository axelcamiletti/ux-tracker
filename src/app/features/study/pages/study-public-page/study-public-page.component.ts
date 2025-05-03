import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Section, WelcomeScreenSection, OpenQuestionSection, MultipleChoiceSection, YesNoSection, PrototypeTestSection, ThankYouSection } from '../../models/section.model';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Importar los componentes de preview
import { WelcomeScreenPreviewComponent } from '../../components/previews/welcome-screen-preview/welcome-screen-preview.component';
import { OpenQuestionPreviewComponent } from '../../components/previews/open-question-preview/open-question-preview.component';
import { YesNoPreviewComponent } from '../../components/previews/yes-no-preview/yes-no-preview.component';
import { MultipleChoicePreviewComponent } from '../../components/previews/multiple-choice-preview/multiple-choice-preview.component';
import { PrototypeTestPreviewComponent } from '../../components/previews/prototype-test-preview/prototype-test-preview.component';
import { ThankYouPreviewComponent } from '../../components/previews/thank-you-preview/thank-you-preview.component';
import { StudyService } from '../../services/study.service';
import { StudyResponsesService } from '../../services/study-responses.service';
import { PrototypeIframePreviewComponent } from "../../components/previews/prototype-iframe-preview/prototype-iframe-preview.component";
import { EventsTrackingService } from '../../services/events-tracking.service';

@Component({
  selector: 'app-study-public-page',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    WelcomeScreenPreviewComponent,
    OpenQuestionPreviewComponent,
    YesNoPreviewComponent,
    MultipleChoicePreviewComponent,
    PrototypeTestPreviewComponent,
    ThankYouPreviewComponent,
    PrototypeIframePreviewComponent
],
  templateUrl: './study-public-page.component.html',
  styleUrl: './study-public-page.component.css',
  animations: [
    trigger('slideInOut', [
      transition(':increment', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':decrement', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class StudyPublicPageComponent implements OnInit {
  currentSectionIndex = 0;
  studyId: string = '';
  responseId: string = '';
  sections: Section[] = [];
  responses: { [key: string]: any } = {};
  prototypeUrl: SafeResourceUrl = '';
  prototypeStart: boolean = false;
  private _lastLoggedSectionId: string | undefined;
  private _currentSection: Section | undefined;
  @ViewChild('iframePrototype') iframePrototype!: ElementRef<HTMLIFrameElement>;
  @ViewChild('prototypeIframe') prototypeIframe!: PrototypeIframePreviewComponent;

  // Variable para controlar si la tarea ha sido completada
  taskCompleted: boolean = false; // Cambiado a público para ser accesible desde el template
  // Colección de eventos Figma para esta sección
  private figmaEvents: any[] = [];

  constructor(
    private studyService: StudyService,
    private studyResponsesService: StudyResponsesService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private eventsTrackingService: EventsTrackingService
  ) {}

  async ngOnInit() {
    this.studyId = this.route.snapshot.params['id'];

    if (!this.studyId) {
      console.error('No se encontró ID del estudio en la URL');
      this.snackBar.open('Error: No se encontró el ID del estudio', 'Cerrar', { duration: 3000 });
      return;
    }

    try {
      const study = await firstValueFrom(this.studyService.getStudyById(this.studyId));

      if (study.status !== 'published') {
        console.warn('Intento de acceder a estudio no publicado');
        this.snackBar.open('Este estudio no está disponible', 'Cerrar', { duration: 3000 });
        return;
      }

      const hasCompleted = localStorage.getItem(`study_${this.studyId}_completed`);

      this.sections = study.sections;
      this.responseId = await this.studyResponsesService.createStudyResponse(this.studyId);

      console.log('Estudio cargado correctamente, secciones:', this.sections.length);

    } catch (error) {
      console.error('Error detallado al cargar el estudio:', error);
      this.snackBar.open('Error al cargar el estudio', 'Cerrar', { duration: 3000 });
    }
  }

  startNow(): void {
    this.studyResponsesService.createStudyResponse(this.studyId)
      .then(id => {
        this.responseId = id;
        // Aquí se puede agregar lógica adicional, por ejemplo, avanzar al siguiente paso
      })
      .catch(error => {
        console.error('Error starting the study response', error);
      });
  }

  nextSection() {
    const currentSection = this.getCurrentSection();

    // Si estamos en la sección de prototipo y el prototipo no está activo aún
    if (currentSection?.type === 'prototype-test' && !this.prototypeStart) {
      this.prototypeStart = true;
      console.log('Prototipo activado, el usuario puede comenzar a interactuar');
      return;
    }

    // Si estamos en sección de prototipo y está activo, solicitar eventos antes de continuar
    if (currentSection?.type === 'prototype-test' && this.prototypeStart && this.prototypeIframe) {
      // Solicitar eventos almacenados en el componente hijo
      this.prototypeIframe.requestEventsHistory();
    }

    if (this.currentSectionIndex < this.sections.length - 1) {
      this.saveCurrentResponse().then(() => {
        this.currentSectionIndex++;
        this._currentSection = undefined; // Reset current section
        // Resetear el estado del prototipo y la tarea completada cuando cambiamos de sección
        if (currentSection?.type === 'prototype-test') {
          this.prototypeStart = false;
          this.taskCompleted = false;
          this.figmaEvents = []; // Limpiar los eventos Figma acumulados
        }
      }).catch(error => {
        console.error('Error al guardar respuesta antes de avanzar:', error);
      });
    } else {
      this.finishStudy();
    }
  }

  previousSection() {
    if (this.currentSectionIndex > 0) {
      this.saveCurrentResponse().then(() => {
        this.currentSectionIndex--;
        this._currentSection = undefined; // Reset current section
      }).catch(error => {
        console.error('Error al guardar respuesta antes de retroceder:', error);
      });
    }
  }

  getCurrentSection(): Section | undefined {
    const section = this.sections[this.currentSectionIndex];
    // Solo logueamos cuando realmente cambia la sección
    if (section?.id !== this._lastLoggedSectionId) {
      this._lastLoggedSectionId = section?.id;
    }
    return section;
  }

  // Type-specific getters for each section type
  getWelcomeSection(): WelcomeScreenSection | undefined {
    this._currentSection = this._currentSection || this.getCurrentSection();
    return this._currentSection?.type === 'welcome-screen' ? this._currentSection as WelcomeScreenSection : undefined;
  }

  getOpenQuestionSection(): OpenQuestionSection | undefined {
    this._currentSection = this._currentSection || this.getCurrentSection();
    return this._currentSection?.type === 'open-question' ? this._currentSection as OpenQuestionSection : undefined;
  }

  getMultipleChoiceSection(): MultipleChoiceSection | undefined {
    this._currentSection = this._currentSection || this.getCurrentSection();
    return this._currentSection?.type === 'multiple-choice' ? this._currentSection as MultipleChoiceSection : undefined;
  }

  getYesNoSection(): YesNoSection | undefined {
    this._currentSection = this._currentSection || this.getCurrentSection();
    return this._currentSection?.type === 'yes-no' ? this._currentSection as YesNoSection : undefined;
  }

  getPrototypeTestSection(): PrototypeTestSection | undefined {
    this._currentSection = this._currentSection || this.getCurrentSection();
    return this._currentSection?.type === 'prototype-test' ? this._currentSection as PrototypeTestSection : undefined;
  }

  getThankYouSection(): ThankYouSection | undefined {
    this._currentSection = this._currentSection || this.getCurrentSection();
    return this._currentSection?.type === 'thank-you' ? this._currentSection as ThankYouSection : undefined;
  }

  // Guardar la respuesta de la sección actual
  private async saveCurrentResponse() {
    const currentSection = this.getCurrentSection();
    const response = this.responses[currentSection?.id || ''];

    if (!currentSection || !response) {
      console.warn('No hay sección actual o respuesta para guardar');
      return;
    }

    try {
      let formattedResponse;
      switch (currentSection.type) {
        case 'open-question':
          formattedResponse = { text: response };
          break;
        case 'multiple-choice':
          formattedResponse = { selectedOptionIds: Array.isArray(response) ? response : [response] };
          break;
        case 'yes-no':
          formattedResponse = { answer: Boolean(response) };
          break;
        case 'prototype-test':
          // Si hay eventos de Figma capturados, los incluimos en la respuesta
          if (response.figmaEventLog && response.figmaEventLog.length > 0) {
            formattedResponse = {
              figmaEventLog: response.figmaEventLog,
              completed: true
            };
            console.log(`Guardando ${response.figmaEventLog.length} eventos de Figma para la sección ${currentSection.id}`);
          } else {
            formattedResponse = {
              figmaEventLog: [],
              completed: true
            };
          }
          break;
        default:
          formattedResponse = { viewed: true };
      }

      await this.studyResponsesService.updateSectionResponse(
        this.responseId,
        currentSection.id,
        {
          type: currentSection.type,
          value: formattedResponse
        }
      );

      console.log(`Respuesta guardada para sección: ${currentSection.id} (${currentSection.type})`);

    } catch (error) {
      console.error('Error detallado al guardar respuesta:', error);
      this.snackBar.open('Error al guardar la respuesta', 'Cerrar', { duration: 3000 });
      throw error;
    }
  }

  // Método para manejar las respuestas de cada tipo de sección
  onResponse(response: any) {
    const currentSection = this.getCurrentSection();
    if (currentSection) {
      this.responses[currentSection.id] = response;
    } else {
      console.warn('Se recibió una respuesta pero no hay sección actual');
    }
  }

  // Método específico para activar el prototipo
  startPrototype(): void {
    this.prototypeStart = true;
    this.taskCompleted = false;
    this.figmaEvents = [];

    // Crear y registrar un evento personalizado para el inicio del prototipo
    const startEvent = {
      type: 'PROTOTYPE_START',
      timestamp: new Date(),
      action: 'Usuario hizo clic en Start Prototype',
      source: 'UI_BUTTON'
    };

    // Registrar en el array local de eventos
    this.figmaEvents.push(startEvent);

    // Registrar en el servicio central de tracking
    this.eventsTrackingService.registerEvent(startEvent);

    console.log('🚀 Prototipo iniciado manualmente por el usuario:', startEvent);
  }

  // Método para detener la tarea manualmente
  stopTask(): void {
    // Crear y registrar un evento personalizado para la detención manual del prototipo
    const stopEvent = {
      type: 'PROTOTYPE_STOP',
      timestamp: new Date(),
      action: 'Usuario detuvo la tarea manualmente',
      source: 'UI_BUTTON',
      completed: false
    };

    // Registrar en el array local de eventos
    this.figmaEvents.push(stopEvent);

    // Registrar en el servicio central de tracking
    this.eventsTrackingService.registerEvent(stopEvent);

    console.log('🛑 Prototipo detenido manualmente por el usuario:', stopEvent);

    // Solicitar eventos almacenados en el componente hijo antes de continuar
    if (this.prototypeIframe) {
      this.prototypeIframe.requestEventsHistory();

      // Añadimos un pequeño retraso para asegurar que se complete la solicitud de eventos
      setTimeout(() => {
        this.savePrototypeResponse(false);
        this.nextSection();
      }, 100);
    } else {
      this.savePrototypeResponse(false);
      this.nextSection();
    }
  }

  // Manejador para cuando la misión se completa (cuando se alcanza la pantalla objetivo)
  onMissionCompleted(completed: boolean): void {
    this.taskCompleted = completed;
    if (completed) {
      // Crear y registrar un evento personalizado para la finalización exitosa de la tarea
      const completionEvent = {
        type: 'PROTOTYPE_COMPLETION',
        timestamp: new Date(),
        action: 'Usuario alcanzó el objetivo del prototipo',
        source: 'TARGET_NODE_REACHED',
        completed: true
      };

      // Registrar en el array local de eventos
      this.figmaEvents.push(completionEvent);

      // Registrar en el servicio central de tracking
      this.eventsTrackingService.registerEvent(completionEvent);

      console.log('✅ Prototipo completado con éxito:', completionEvent);

      // Solicitar eventos almacenados en el componente hijo antes de continuar
      if (this.prototypeIframe) {
        this.prototypeIframe.requestEventsHistory();
      }

      // Guardar la respuesta con el estado completado
      this.savePrototypeResponse(true);

      // Mostrar mensaje de éxito
      this.snackBar.open('¡Tarea completada! Avanzando a la siguiente sección en 3 segundos...', '', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });

      // Avanzar automáticamente después de 3 segundos
      setTimeout(() => {
        this.nextSection();
      }, 3000);
    }
  }

  // Manejador para eventos de Figma
  onFigmaEvent(event: any): void {
    // Guardar evento en el array
    this.figmaEvents.push(event);
  }

  // Guardar respuesta del prototipo
  private savePrototypeResponse(completed: boolean): void {
    const currentSection = this.getCurrentSection();
    if (currentSection?.type === 'prototype-test') {
      this.responses[currentSection.id] = {
        figmaEventLog: this.figmaEvents,
        completed: completed || this.taskCompleted,
        timeSpent: this.calculateTimeSpent()
      };
    }
  }

  // Calcular tiempo dedicado a la tarea
  private calculateTimeSpent(): number {
    if (this.figmaEvents.length < 2) return 0;

    // Calcular la diferencia entre el primer y último evento
    const firstEvent = this.figmaEvents[0].timestamp;
    const lastEvent = this.figmaEvents[this.figmaEvents.length - 1].timestamp;

    return (new Date(lastEvent).getTime() - new Date(firstEvent).getTime()) / 1000; // en segundos
  }

  // Manejador para cuando se solicita el historial de eventos desde el componente hijo
  onEventsHistoryRequested(events: any[]): void {
    console.log('📊 Historial de eventos solicitado, recibidos:', events.length);

    // Combinar los eventos del iframe con los eventos UI capturados en este componente
    const allEvents = [...this.figmaEvents];

    // Si hay eventos recibidos desde el componente hijo, agregarlos
    // solo si no están ya incluidos (para evitar duplicados)
    if (events && events.length > 0) {
      events.forEach(event => {
        // Verificar que el evento no esté ya en la lista (comparando por timestamp)
        const exists = allEvents.some(e =>
          e.timestamp && event.timestamp &&
          new Date(e.timestamp).getTime() === new Date(event.timestamp).getTime() &&
          e.type === event.type
        );

        if (!exists) {
          allEvents.push(event);
        }
      });
    }

    // Ordenar eventos por timestamp
    const sortedEvents = allEvents.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    console.log('📊 Total de eventos combinados:', sortedEvents.length);

    // Actualizar el array local
    this.figmaEvents = sortedEvents;

    // Registrar en el servicio central (solo los que no estén ya registrados)
    this.eventsTrackingService.registerEvents(sortedEvents);

    // También actualizar la respuesta actual
    this.updatePrototypeResponse();
  }

  // Método para actualizar la respuesta del prototipo con los últimos eventos
  private updatePrototypeResponse(): void {
    const currentSection = this.getCurrentSection();
    if (currentSection?.type === 'prototype-test') {
      this.responses[currentSection.id] = {
        figmaEventLog: this.figmaEvents,
        completed: this.taskCompleted,
        timeSpent: this.calculateTimeSpent()
      };
    }
  }

  // Finalizar el estudio
  private async finishStudy() {
    try {
      await this.saveCurrentResponse();

      await this.studyResponsesService.completeStudy(this.responseId);

      localStorage.setItem(`study_${this.studyId}_completed`, 'true');

      this.snackBar.open('¡Gracias por completar el estudio!', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error detallado al finalizar el estudio:', error);
      this.snackBar.open('Error al finalizar el estudio', 'Cerrar', { duration: 3000 });
    }
  }
}
