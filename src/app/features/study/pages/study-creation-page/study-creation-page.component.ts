import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

// Componentes de formularios
import { WelcomeScreenFormComponent } from "../../components/forms/welcome-screen-form/welcome-screen-form.component";
import { ThankYouFormComponent } from "../../components/forms/thank-you-form/thank-you-form.component";
import { MultipleChoiceFormComponent } from "../../components/forms/multiple-choice-form/multiple-choice-form.component";
import { YesNoFormComponent } from "../../components/forms/yes-no-form/yes-no-form.component";
import { PrototypeTestFormComponent } from "../../components/forms/prototype-test-form/prototype-test-form.component";
import { OpenQuestionFormComponent } from "../../components/forms/open-question-form/open-question-form.component";

// Componentes de previsualización
import { WelcomeScreenPreviewComponent } from "../../components/previews/welcome-screen-preview/welcome-screen-preview.component";
import { ThankYouPreviewComponent } from "../../components/previews/thank-you-preview/thank-you-preview.component";
import { OpenQuestionPreviewComponent } from "../../components/previews/open-question-preview/open-question-preview.component";
import { PrototypeTestPreviewComponent } from "../../components/previews/prototype-test-preview/prototype-test-preview.component";
import { YesNoPreviewComponent } from "../../components/previews/yes-no-preview/yes-no-preview.component";
import { MultipleChoicePreviewComponent } from "../../components/previews/multiple-choice-preview/multiple-choice-preview.component";

// Componentes y servicios
import { ClipElementComponent } from "../../components/clip-element/clip-element.component";

// Modelos
import { MultipleChoiceSection, OpenQuestionSection, PrototypeTestSection, Section, ThankYouSection, WelcomeScreenSection, YesNoSection } from '../../models/section.model';
import { StudyService } from '../../services/study.service';
import { StudyStateService } from '../../services/study-state.service';
import { PrototypeIframePreviewComponent } from "../../components/previews/prototype-iframe-preview/prototype-iframe-preview.component";

@Component({
  selector: 'app-study-creation-page',
  standalone: true,
  imports: [
    // Módulos de Angular
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatButtonModule,
    MatMenuModule,
    DragDropModule,
    MatProgressSpinnerModule,
    // Componentes de formularios
    MultipleChoiceFormComponent,
    YesNoFormComponent,
    PrototypeTestFormComponent,
    OpenQuestionFormComponent,
    WelcomeScreenFormComponent,
    ThankYouFormComponent,
    // Componentes de previsualización
    OpenQuestionPreviewComponent,
    YesNoPreviewComponent,
    MultipleChoicePreviewComponent,
    WelcomeScreenPreviewComponent,
    ThankYouPreviewComponent,
    // Componentes personalizados
    ClipElementComponent,
    PrototypeIframePreviewComponent
],
  templateUrl: './study-creation-page.component.html',
  styleUrl: './study-creation-page.component.css'
})
export class StudyCreationPageComponent implements OnInit, OnDestroy {
  isPrototypePreview = false;
  // Array de secciones dinámicas
  sections: Section[] = [];

  // La sección actualmente seleccionada (la que se mostrará en el Form y en el Preview)
  selectedSection: Section | null = null;

  // Controla si se muestra el menú para crear clips
  showClipMenu: boolean = false;

  // Sección de bienvenida fija
  welcomeSection: WelcomeScreenSection = {
    id: 'welcome',
    title: 'A-mazeing to meet you!',
    description: 'Has sido invitado a compartir tus opiniones, ideas y puntos de vista',
    required: true,
    type: 'welcome-screen',
    data: {
      welcomeMessage: 'Has sido invitado a compartir tus opiniones, ideas y puntos de vista',
      imageUrl: undefined
    }
  };

  // Sección de Prototipo Iframe
  iframeSection = {
    prototypeUrl: '',
  };

  // Sección de agradecimiento fija
  thankYouSection: ThankYouSection = {
    id: 'thanks',
    title: 'Thank You!',
    description: 'Completaste nuestro prototipo',
    required: true,
    type: 'thank-you',
    data: {
      thankYouMessage: 'Completaste nuestro prototipo, y no podemos agradecerte lo suficiente por ello! Gracias por ayudarnos a construir un mejor producto: ¡Espero que lo hayan disfrutado!',
      imageUrl: undefined
    }
  };

  saving = false;
  lastSaved: Date | null = null;
  private studyId: string | null = null;
  private destroy$ = new Subject<void>();
  private autoSave$ = new Subject<void>();
  studyName: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studyService: StudyService,
    private snackBar: MatSnackBar,
    private studyState: StudyStateService
  ) {
    // Configurar el guardado automático
    this.autoSave$.pipe(
      debounceTime(2000), // Esperar 2 segundos de inactividad
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.studyId) {
        this.studyState.saveStudy(this.studyId);
      }
    });
  }

  ngOnInit() {
    this.studyId = this.route.parent?.snapshot.paramMap.get('id') || '';

    if (!this.studyId) {
      this.snackBar.open('Error: No se encontró el ID del estudio', 'Cerrar');
      this.router.navigate(['/projects']);
      return;
    }

    // Seleccionar la sección de bienvenida por defecto para evitar pantalla en blanco
    this.selectWelcomeSection();

    this.loadExistingStudy(this.studyId);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Método para guardar el estudio
  async saveStudy() {
    if (!this.studyId) return;
    this.studyState.saveStudy(this.studyId);
  }

  // Función para generar IDs únicos (aquí lo hacemos como string)
  generateUniqueId(): string {
    return 'section-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  // Función para agregar una nueva sección
  addSection(type: Section['type']): void {
    const baseSection = {
      id: this.generateUniqueId(),
      title: '',
      description: '',
      required: true
    };

    let newSection: Section;

    switch (type) {
      case 'open-question':
        newSection = {
          ...baseSection,
          type: 'open-question',
          data: this.getInitialData('open-question')
        } as OpenQuestionSection;
        break;
      case 'multiple-choice':
        newSection = {
          ...baseSection,
          type: 'multiple-choice',
          data: this.getInitialData('multiple-choice')
        } as MultipleChoiceSection;
        break;
      case 'yes-no':
        newSection = {
          ...baseSection,
          type: 'yes-no',
          data: this.getInitialData('yes-no')
        } as YesNoSection;
        break;
      case 'prototype-test':
        newSection = {
          ...baseSection,
          type: 'prototype-test',
          data: this.getInitialData('prototype-test')
        } as PrototypeTestSection;
        break;
      default:
        throw new Error(`Tipo de sección no soportado: ${type}`);
    }

    this.sections.push(newSection);
    this.selectSection(newSection);
    this.showClipMenu = false;

    // Actualizar el estado y solicitar guardado
    this.studyState.setSections([...this.sections]);
    this.autoSave$.next();
  }

  // Helper para inicializar 'data' según el tipo
  getInitialData(type: Section['type']): any {
    switch (type) {
      case 'open-question':
        return {
          placeholder: '',
          minLength: undefined,
          maxLength: undefined
        };
      case 'prototype-test':
        return {
          prototypeUrl: '',
          instructions: ''
        };
      case 'yes-no':
        return {
          yesLabel: 'Sí',
          noLabel: 'No'
        };
      case 'multiple-choice':
        return {
          options: [
            { id: `option-0`, text: 'Opción 1' },
            { id: `option-1`, text: 'Opción 2' },
            { id: `option-2`, text: 'Opción 3' }
          ],
          allowMultiple: false
        };
      default:
        return {};
    }
  }

  // Selecciona una sección (al hacer clic en un clip)
  selectSection(section: Section): void {
    this.selectedSection = section;
    this.isPrototypePreview = section.type === 'prototype-test';
  }

  // Elimina una sección
  removeSection(sectionId: string): void {
    this.sections = this.sections.filter(s => s.id !== sectionId);
    if (this.selectedSection && this.selectedSection.id === sectionId) {
      this.selectedSection = null;
    }

    // Actualizar el estado y solicitar guardado
    this.studyState.setSections([...this.sections]);
    this.autoSave$.next();
  }

  // Actualizar una sección
  updateSection(section: Section): void {
    const index = this.sections.findIndex(s => s.id === section.id);
    if (index !== -1) {
      this.sections[index] = section;
      this.studyState.setSections([...this.sections]);
      this.autoSave$.next();
    }
  }

  // Función para seleccionar la sección de bienvenida
  selectWelcomeSection(): void {
    this.selectedSection = this.welcomeSection;
    this.isPrototypePreview = false;
  }

  // Función para seleccionar la sección de agradecimiento
  selectThankSection(): void {
    this.selectedSection = this.thankYouSection;
    this.isPrototypePreview = false;
  }

  private async loadExistingStudy(studyId: string) {
    try {
      const study = await this.studyService.getStudyById(studyId).toPromise();
      if (!study) {
        throw new Error('No se encontró el estudio');
      }

      this.studyId = study.id;
      this.studyName = study.name;

      // Asegurarnos de que sections existe, si no, inicializarlo como array vacío
      const sections = study.sections || [];

      // Encontrar las secciones de bienvenida y agradecimiento
      const welcomeSection = sections.find(s => s.type === 'welcome-screen');
      const thankYouSection = sections.find(s => s.type === 'thank-you');

      // Actualizar las secciones fijas si existen
      if (welcomeSection) {
        this.welcomeSection = welcomeSection;
      }
      if (thankYouSection) {
        this.thankYouSection = thankYouSection;
      }

      // Filtrar las secciones dinámicas
      this.sections = sections.filter(section =>
        section.type !== 'welcome-screen' && section.type !== 'thank-you'
      );

      // Actualizar el estado en el servicio
      this.studyState.setWelcomeSection(this.welcomeSection);
      this.studyState.setThankYouSection(this.thankYouSection);
      this.studyState.setSections(this.sections);

      // Seleccionar la primera sección si existe
      if (this.sections.length > 0) {
        this.selectSection(this.sections[0]);
      } else {
        // Si no hay secciones dinámicas, asegurar que la sección de bienvenida esté seleccionada
        this.selectWelcomeSection();
      }
    } catch (error) {
      console.error('Error loading study:', error);
      this.snackBar.open('Error al cargar el estudio', 'Cerrar', { duration: 3000 });
      // Redirigir al usuario a la página de proyectos en caso de error
      this.router.navigate(['/projects']);
    }
  }
}
