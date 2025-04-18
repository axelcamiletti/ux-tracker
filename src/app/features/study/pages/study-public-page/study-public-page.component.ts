import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Section } from '../../models/section.model';
import { ActivatedRoute, Router } from '@angular/router';
/* import { StudyService, StudyResponse, Study } from '../../services/study.service'; */
import { trigger, transition, style, animate } from '@angular/animations';

// Importar los componentes de preview
import { WelcomeScreenPreviewComponent } from '../../components/previews/welcome-screen-preview/welcome-screen-preview.component';
import { OpenQuestionPreviewComponent } from '../../components/previews/open-question-preview/open-question-preview.component';
import { YesNoPreviewComponent } from '../../components/previews/yes-no-preview/yes-no-preview.component';
import { MultipleChoicePreviewComponent } from '../../components/previews/multiple-choice-preview/multiple-choice-preview.component';
import { PrototypeTestPreviewComponent } from '../../components/previews/prototype-test-preview/prototype-test-preview.component';
import { ThankYouPreviewComponent } from '../../components/previews/thank-you-preview/thank-you-preview.component';
import { Study } from '../../models/study.model';
import { StudyService } from '../../services/study.service';
import { StudyResponse } from '../../models/study-response.model';

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
  sections: Section[] = [
    {
      id: 'welcome',
      type: 'welcome-screen',
      data: {
        title: '¡Bienvenido a nuestro estudio de UX!',
        subtitle: 'Tu opinión es muy importante para nosotros. Por favor, tómate unos minutos para responder las siguientes preguntas.'
      }
    },
    {
      id: 'question1',
      type: 'open-question',
      data: {
        title: 'Primera impresión',
        subtitle: '¿Cuál fue tu primera impresión al ver la interfaz?'
      }
    },
    {
      id: 'question2',
      type: 'multiple-choice',
      data: {
        title: 'Frecuencia de uso',
        subtitle: '¿Con qué frecuencia usarías esta funcionalidad?',
        selectionType: 'single',
        options: [
          { id: 1, label: 'Diariamente' },
          { id: 2, label: 'Semanalmente' },
          { id: 3, label: 'Mensualmente' },
          { id: 4, label: 'Raramente' }
        ]
      }
    },
    {
      id: 'question3',
      type: 'yes-no',
      data: {
        title: 'Facilidad de uso',
        subtitle: '¿Te resultó fácil encontrar la información que buscabas?'
      }
    },
    {
      id: 'question4',
      type: 'prototype-test',
      data: {
        title: 'Prueba de prototipo',
        subtitle: 'Por favor, completa las siguientes tareas:',
        prototypeUrl: 'https://example.com/prototype.png',
        tasks: [
          'Encuentra el menú de configuración',
          'Cambia tu foto de perfil',
          'Busca un contacto específico'
        ]
      }
    },
    {
      id: 'question5',
      type: 'multiple-choice',
      data: {
        title: 'Características importantes',
        subtitle: '¿Qué características consideras más importantes? (Puedes seleccionar varias)',
        selectionType: 'multiple',
        options: [
          { id: 1, label: 'Diseño moderno' },
          { id: 2, label: 'Velocidad de carga' },
          { id: 3, label: 'Facilidad de uso' },
          { id: 4, label: 'Funcionalidades avanzadas' }
        ]
      }
    },
    {
      id: 'thanks',
      type: 'thank-you',
      data: {
        title: '¡Gracias por tu participación!',
        subtitle: 'Tu feedback es invaluable para nosotros. Con tu ayuda, podremos mejorar la experiencia de usuario.'
      }
    }
  ];
  responses: { [key: string]: any } = {};

  constructor(
    private studyService: StudyService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener el ID del estudio de la URL
    this.studyId = this.route.snapshot.params['id'];
    
    // Crear un estudio mock con las secciones
    const mockStudy: Study = {
      id: this.studyId || 'mock-study',
      name: 'Estudio de UX',
      sections: this.sections,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: '',
      status: 'draft'
    };

    // Establecer el estudio actual
    this.studyService.setCurrentStudy(mockStudy);

    // Suscribirse a las respuestas guardadas
    this.studyService.getResponses().subscribe(responses => {
      // Actualizar las respuestas locales con las guardadas
      responses.forEach(response => {
        this.responses[response.sectionId] = response.responses;
        
        // Actualizar la sección correspondiente con la respuesta
        const section = this.sections.find(s => s.id === response.sectionId);
        if (section) {
          section.response = response.responses;
        }
      });
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
      section.response = this.responses[section.id];
    }
    return section;
  }

  // Guardar la respuesta de la sección actual
  private saveCurrentResponse() {
    const currentSection = this.getCurrentSection();
    if (currentSection && this.responses[currentSection.id]) {
      const response: StudyResponse = {
        sectionId: currentSection.id,
        studyId: this.studyId,
        userId: 'current-user', // TODO: Reemplazar con el ID del usuario actual
        responses: this.responses[currentSection.id],
        startedAt: new Date(),
        status: 'in-progress'
      };
      this.studyService.saveResponse(response);
    }
  }

  // Método para manejar las respuestas de cada tipo de sección
  onResponse(response: any) {
    const currentSection = this.getCurrentSection();
    if (currentSection) {
      this.responses[currentSection.id] = response;
      currentSection.response = response;
    }
  }

  // Finalizar el estudio
  private finishStudy() {
    this.saveCurrentResponse();
    // Aquí podrías agregar lógica adicional al finalizar el estudio
    this.router.navigate(['/study-completed']);
  }
}
