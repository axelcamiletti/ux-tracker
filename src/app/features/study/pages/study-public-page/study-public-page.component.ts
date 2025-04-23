import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Section, WelcomeScreenSection, OpenQuestionSection, MultipleChoiceSection, YesNoSection, PrototypeTestSection, ThankYouSection } from '../../models/section.model';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { firstValueFrom } from 'rxjs';

// Importar los componentes de preview
import { WelcomeScreenPreviewComponent } from '../../components/previews/welcome-screen-preview/welcome-screen-preview.component';
import { OpenQuestionPreviewComponent } from '../../components/previews/open-question-preview/open-question-preview.component';
import { YesNoPreviewComponent } from '../../components/previews/yes-no-preview/yes-no-preview.component';
import { MultipleChoicePreviewComponent } from '../../components/previews/multiple-choice-preview/multiple-choice-preview.component';
import { PrototypeTestPreviewComponent } from '../../components/previews/prototype-test-preview/prototype-test-preview.component';
import { ThankYouPreviewComponent } from '../../components/previews/thank-you-preview/thank-you-preview.component';
import { StudyService } from '../../services/study.service';
import { StudyResponsesService } from '../../services/study-responses.service';

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
    ThankYouPreviewComponent
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
  private _lastLoggedSectionId: string | undefined;
  private _currentSection: Section | undefined;

  constructor(
    private studyService: StudyService,
    private studyResponsesService: StudyResponsesService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    console.log('Iniciando estudio público');
    this.studyId = this.route.snapshot.params['id'];

    if (!this.studyId) {
      console.error('No se encontró ID del estudio en la URL');
      this.snackBar.open('Error: No se encontró el ID del estudio', 'Cerrar', { duration: 3000 });
      return;
    }

    try {
      console.log('Cargando estudio con ID:', this.studyId);
      const study = await firstValueFrom(this.studyService.getStudyById(this.studyId));
      console.log('Estudio cargado:', study);

      if (study.status !== 'published') {
        console.warn('Intento de acceder a estudio no publicado');
        this.snackBar.open('Este estudio no está disponible', 'Cerrar', { duration: 3000 });
        return;
      }

      const hasCompleted = localStorage.getItem(`study_${this.studyId}_completed`);
      console.log('Estado de completado previo:', hasCompleted);

      this.sections = study.sections;
      console.log('Secciones cargadas:', this.sections);

      this.responseId = await this.studyResponsesService.createStudyResponse(this.studyId);
      console.log('Nueva respuesta creada con ID:', this.responseId);

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
    console.log('Avanzando a siguiente sección');
    if (this.currentSectionIndex < this.sections.length - 1) {
      this.saveCurrentResponse().then(() => {
        console.log('Respuesta guardada, avanzando a siguiente sección');
        this.currentSectionIndex++;
        this._currentSection = undefined; // Reset current section
        console.log('Índice actual:', this.currentSectionIndex);
      }).catch(error => {
        console.error('Error al guardar respuesta antes de avanzar:', error);
      });
    } else {
      console.log('Última sección alcanzada, finalizando estudio');
      this.finishStudy();
    }
  }

  previousSection() {
    console.log('Retrocediendo a sección anterior');
    if (this.currentSectionIndex > 0) {
      this.saveCurrentResponse().then(() => {
        console.log('Respuesta guardada, retrocediendo a sección anterior');
        this.currentSectionIndex--;
        this._currentSection = undefined; // Reset current section
        console.log('Índice actual:', this.currentSectionIndex);
      }).catch(error => {
        console.error('Error al guardar respuesta antes de retroceder:', error);
      });
    }
  }

  getCurrentSection(): Section | undefined {
    const section = this.sections[this.currentSectionIndex];
    // Solo logueamos cuando realmente cambia la sección
    if (section?.id !== this._lastLoggedSectionId) {
      console.log('Sección actual:', section);
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

    console.log('Intentando guardar respuesta:', {
      sectionId: currentSection?.id,
      sectionType: currentSection?.type,
      response: response
    });

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
          formattedResponse = {
            completed: true,
            timeSpent: response.timeSpent || 0,
            interactions: response.interactions || []
          };
          break;
        default:
          formattedResponse = { viewed: true };
      }

      console.log('Guardando respuesta formateada:', {
        responseId: this.responseId,
        sectionId: currentSection.id,
        type: currentSection.type,
        formattedResponse
      });

      await this.studyResponsesService.updateSectionResponse(
        this.responseId,
        currentSection.id,
        {
          type: currentSection.type,
          value: formattedResponse
        }
      );

      console.log('Respuesta guardada exitosamente');
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
      console.log('Respuesta recibida para sección', {
        sectionId: currentSection.id,
        sectionType: currentSection.type,
        response: response
      });

      this.responses[currentSection.id] = response;
    } else {
      console.warn('Se recibió una respuesta pero no hay sección actual');
    }
  }

  // Finalizar el estudio
  private async finishStudy() {
    console.log('Iniciando proceso de finalización del estudio');
    try {
      console.log('Guardando última respuesta');
      await this.saveCurrentResponse();

      console.log('Marcando estudio como completado');
      await this.studyResponsesService.completeStudy(this.responseId);

      localStorage.setItem(`study_${this.studyId}_completed`, 'true');
      console.log('Estudio marcado como completado en localStorage');

      this.snackBar.open('¡Gracias por completar el estudio!', 'Cerrar', { duration: 3000 });
      console.log('Redirigiendo a página principal');
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error detallado al finalizar el estudio:', error);
      this.snackBar.open('Error al finalizar el estudio', 'Cerrar', { duration: 3000 });
    }
  }
}
