import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
import { Section } from '../../models/section.model';
import { StudyService } from '../../services/study.service';
import { Study } from '../../models/study.model';
import { StudyStateService } from '../../services/study-state.service';
import { ToolbarComponent } from "../../components/toolbar/toolbar.component";

@Component({
  selector: 'app-study-creation-page',
  standalone: true,
  imports: [
    // Módulos de Angular
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
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
    PrototypeTestPreviewComponent,
    YesNoPreviewComponent,
    MultipleChoicePreviewComponent,
    WelcomeScreenPreviewComponent,
    ThankYouPreviewComponent,
    // Componentes personalizados
    ClipElementComponent,
    ToolbarComponent
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
  welcomeSection: Section = {
    id: 'welcome',
    type: 'welcome-screen',
    data: {
      title: 'A-mazeing to meet you!',
      subtitle: 'Please read the instructions carefully'
    }
  };

  // Sección de agradecimiento fija
  thankYouSection: Section = {
    id: 'thanks',
    type: 'thank-you',
    data: {
      title: 'Thank You!',
      subtitle: 'Completaste nuestro prototipo, y no podemos agradecerte lo suficiente por ello! Gracias por ayudarnos a construir un mejor producto: ¡Espero que lo hayan disfrutado!'
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
      this.saveStudy();
    });
  }

  ngOnInit() {
    this.studyId = this.route.parent?.snapshot.paramMap.get('id') || '';
    
    if (!this.studyId) {
      this.snackBar.open('Error: No se encontró el ID del estudio', 'Cerrar');
      this.router.navigate(['/projects']);
      return;
    }

    this.loadExistingStudy(this.studyId);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Método para guardar el estudio
  async saveStudy() {
    if (!this.studyId) return;

    try {
      const allSections = [this.welcomeSection, ...this.sections, this.thankYouSection];
      await this.studyService.updateStudy(this.studyId, {
        name: this.studyName || 'Nuevo estudio',
        sections: allSections,
        updatedAt: new Date()
      });
      this.studyState.completeSave();
      this.snackBar.open('Cambios guardados', 'Cerrar', { duration: 2000 });
    } catch (error) {
      console.error('Error saving study:', error);
      this.studyState.errorSave();
      this.snackBar.open('Error al guardar los cambios', 'Cerrar', { duration: 3000 });
    }
  }

  // Función para generar IDs únicos (aquí lo hacemos como string)
  generateUniqueId(): string {
    return 'section-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  // Función para agregar una nueva sección
  addSection(type: 'open-question' | 'prototype-test' | 'yes-no' | 'multiple-choice'): void {
    const newSection: Section = {
      id: this.generateUniqueId(),
      type,
      data: this.getInitialData(type),
    };

    this.sections.push(newSection);
    this.selectSection(newSection);
    this.showClipMenu = false;

    // Actualizar el estado y solicitar guardado
    this.studyState.setSections([...this.sections]);
    this.autoSave$.next();
  }

  // Helper para inicializar 'data' según el tipo
  getInitialData(type: 'open-question' | 'prototype-test' | 'yes-no' | 'multiple-choice'): any {
    switch (type) {
      case 'open-question':
        return { title: '', subtitle: '' };
      case 'prototype-test':
        return { prototypeUrl: '', tasks: [] };
      case 'yes-no':
        return { title: '', options: ['Sí', 'No'] };
      case 'multiple-choice':
        return { title: '', options: [] };
      default:
        return {};
    }
  }

  // Selecciona una sección (al hacer clic en un clip)
  selectSection(section: Section): void {
    this.selectedSection = section;
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
  }

  // Función para seleccionar la sección de bienvenida
  selectThankSection(): void {
    this.selectedSection = this.thankYouSection;
  }

  private async loadExistingStudy(studyId: string) {
    try {
      const study = await this.studyService.getStudyById(studyId).toPromise();
      if (study) {
        this.studyId = study.id;
        this.studyName = study.name;
        
        // Encontrar las secciones de bienvenida y agradecimiento
        const welcomeSection = study.sections.find(s => s.type === 'welcome-screen');
        const thankYouSection = study.sections.find(s => s.type === 'thank-you');
        
        // Actualizar las secciones fijas si existen
        if (welcomeSection) {
          this.welcomeSection = welcomeSection;
        }
        if (thankYouSection) {
          this.thankYouSection = thankYouSection;
        }
        
        // Filtrar las secciones dinámicas
        this.sections = study.sections.filter(section => 
          section.type !== 'welcome-screen' && section.type !== 'thank-you'
        );
        
        // Actualizar el estado en el servicio
        this.studyState.setWelcomeSection(this.welcomeSection);
        this.studyState.setThankYouSection(this.thankYouSection);
        this.studyState.setSections(this.sections);
        
        // Seleccionar la primera sección si existe
        this.selectedSection = this.sections[0] || null;
      }
    } catch (error) {
      console.error('Error loading study:', error);
      this.snackBar.open('Error al cargar el estudio', 'Cerrar', { duration: 3000 });
    }
  }
}
