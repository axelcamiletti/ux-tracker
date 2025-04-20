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

  constructor(
    private studyService: StudyService,
    private studyResponsesService: StudyResponsesService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    // Obtener el ID del estudio de la URL
    this.studyId = this.route.snapshot.params['id'];

    if (!this.studyId) {
      this.snackBar.open('Error: No se encontró el ID del estudio', 'Cerrar', { duration: 3000 });
      return;
    }

    try {
      // Cargar el estudio
      const study = await firstValueFrom(this.studyService.getStudyById(this.studyId));

      if (study.status !== 'published') {
        this.snackBar.open('Este estudio no está disponible', 'Cerrar', { duration: 3000 });
        return;
      }

      // Verificar si el usuario ya completó el estudio y no se permiten múltiples respuestas
      const hasCompleted = localStorage.getItem(`study_${this.studyId}_completed`);
      /* if (hasCompleted && !study.allowMultipleResponses) {
        this.snackBar.open('Ya has completado este estudio', 'Cerrar', { duration: 3000 });
        return;
      } */

      this.sections = study.sections;

      // Crear una nueva respuesta de estudio
      this.responseId = await this.studyResponsesService.createStudyResponse(this.studyId);

    } catch (error) {
      console.error('Error loading study:', error);
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
    if (this.currentSectionIndex < this.sections.length - 1) {
      // Guardar la respuesta de la sección actual antes de avanzar
      this.saveCurrentResponse();
      this.currentSectionIndex++;
    } else {
      // Si es la última sección, finalizar el estudio
      this.finishStudy();
    }
  }

  previousSection() {
    if (this.currentSectionIndex > 0) {
      // Guardar la respuesta actual antes de retroceder
      this.saveCurrentResponse();
      this.currentSectionIndex--;
    }
  }

  getCurrentSection(): Section | undefined {
    const section = this.sections[this.currentSectionIndex];
    if (section) {
      // Asegurarnos de que la sección tenga la respuesta guardada
      /* section.response = this.responses[section.id]; */
    }
    return section;
  }

  // Type-specific getters for each section type
  getWelcomeSection(): WelcomeScreenSection | undefined {
    const section = this.getCurrentSection();
    return section?.type === 'welcome-screen' ? section as WelcomeScreenSection : undefined;
  }

  getOpenQuestionSection(): OpenQuestionSection | undefined {
    const section = this.getCurrentSection();
    return section?.type === 'open-question' ? section as OpenQuestionSection : undefined;
  }

  getMultipleChoiceSection(): MultipleChoiceSection | undefined {
    const section = this.getCurrentSection();
    return section?.type === 'multiple-choice' ? section as MultipleChoiceSection : undefined;
  }

  getYesNoSection(): YesNoSection | undefined {
    const section = this.getCurrentSection();
    return section?.type === 'yes-no' ? section as YesNoSection : undefined;
  }

  getPrototypeTestSection(): PrototypeTestSection | undefined {
    const section = this.getCurrentSection();
    return section?.type === 'prototype-test' ? section as PrototypeTestSection : undefined;
  }

  getThankYouSection(): ThankYouSection | undefined {
    const section = this.getCurrentSection();
    return section?.type === 'thank-you' ? section as ThankYouSection : undefined;
  }

  // Guardar la respuesta de la sección actual
  private async saveCurrentResponse() {
    const currentSection = this.getCurrentSection();
    if (currentSection && this.responses[currentSection.id]) {
      try {
        await this.studyResponsesService.updateSectionResponse(
          this.responseId,
          currentSection.id,
          {
            type: currentSection.type,
            value: this.responses[currentSection.id]
          }
        );
      } catch (error) {
        console.error('Error saving response:', error);
        this.snackBar.open('Error al guardar la respuesta', 'Cerrar', { duration: 3000 });
      }
    }
  }

  // Método para manejar las respuestas de cada tipo de sección
  onResponse(response: any) {
    const currentSection = this.getCurrentSection();
    if (currentSection) {
      this.responses[currentSection.id] = response;
      /* currentSection.response = response; */
    }
  }

  // Finalizar el estudio
  private async finishStudy() {
    try {
      await this.saveCurrentResponse();
      await this.studyResponsesService.completeStudy(this.responseId);

      // Marcar el estudio como completado en localStorage
      localStorage.setItem(`study_${this.studyId}_completed`, 'true');

      this.snackBar.open('¡Gracias por completar el estudio!', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error completing study:', error);
      this.snackBar.open('Error al finalizar el estudio', 'Cerrar', { duration: 3000 });
    }
  }
}
