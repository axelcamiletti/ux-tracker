import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import {
  Section,
  WelcomeScreenSection,
  YesNoSection,
  OpenQuestionSection,
  MultipleChoiceSection,
  PrototypeTestSection,
  ThankYouSection
} from '../models/section.model';
import { StudyService } from './study.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class StudyStateService {
  private sections = new BehaviorSubject<Section[]>([]);
  private welcomeSectionSubject = new BehaviorSubject<WelcomeScreenSection | null>(null);
  private yesNoSectionSubject = new BehaviorSubject<YesNoSection | null>(null);
  private openQuestionSectionSubject = new BehaviorSubject<OpenQuestionSection | null>(null);
  private multipleChoiceSectionSubject = new BehaviorSubject<MultipleChoiceSection | null>(null);
  private prototypeTestSectionSubject = new BehaviorSubject<PrototypeTestSection | null>(null);
  private thankYouSectionSubject = new BehaviorSubject<ThankYouSection | null>(null);
  private saveRequested = new Subject<void>();
  private saving = new BehaviorSubject<boolean>(false);
  private lastSaved = new BehaviorSubject<Date | null>(null);
  private studyService = inject(StudyService);
  private snackBar = inject(MatSnackBar);

  sections$ = this.sections.asObservable();
  welcomeSection$ = this.welcomeSectionSubject.asObservable();
  yesNoSection$ = this.yesNoSectionSubject.asObservable();
  openQuestionSection$ = this.openQuestionSectionSubject.asObservable();
  multipleChoiceSection$ = this.multipleChoiceSectionSubject.asObservable();
  prototypeTestSection$ = this.prototypeTestSectionSubject.asObservable();
  thankYouSection$ = this.thankYouSectionSubject.asObservable();
  saveRequested$ = this.saveRequested.asObservable();
  saving$ = this.saving.asObservable();
  lastSaved$ = this.lastSaved.asObservable();

  setSections(sections: Section[]) {
    this.sections.next(sections);
  }

  setWelcomeSection(section: WelcomeScreenSection) {
    this.welcomeSectionSubject.next(section);
  }

  setYesNoSection(section: YesNoSection) {
    this.yesNoSectionSubject.next(section);
  }

  setOpenQuestionSection(section: OpenQuestionSection) {
    this.openQuestionSectionSubject.next(section);
  }

  setMultipleChoiceSection(section: MultipleChoiceSection) {
    this.multipleChoiceSectionSubject.next(section);
  }

  setPrototypeTestSection(section: PrototypeTestSection) {
    console.log('StudyStateService: setPrototypeTestSection called with:', section);

    const currentSections = this.sections.getValue();
    console.log('StudyStateService: Current sections:', currentSections);

    const index = currentSections.findIndex(s => s.id === section.id);
    if (index !== -1) {
      console.log('StudyStateService: Updating existing section at index:', index);
      currentSections[index] = section;
      this.sections.next([...currentSections]);
    }

    this.prototypeTestSectionSubject.next(section);
    console.log('StudyStateService: Updated prototype section');

    if (this.saveRequested) {
      console.log('StudyStateService: Triggering autosave');
      this.saveRequested.next();
    }
  }

  setThankYouSection(section: ThankYouSection) {
    this.thankYouSectionSubject.next(section);
  }

  setSaving(saving: boolean) {
    this.saving.next(saving);
  }

  setLastSaved(date: Date) {
    this.lastSaved.next(date);
  }

  async saveStudy(studyId: string) {
    console.log('StudyStateService: Iniciando guardado...', { studyId });
    if (this.saving.value) {
      console.log('StudyStateService: Guardado ya en progreso, saliendo...');
      return;
    }

    try {
      this.setSaving(true);
      console.log('StudyStateService: Obteniendo estudio actual...');
      const study = await firstValueFrom(this.studyService.getCurrentStudy());
      console.log('StudyStateService: Estudio obtenido:', study);

      if (study) {
        // Obtener todas las secciones actuales
        const welcomeSection = this.welcomeSectionSubject.value;
        const sections = this.sections.value;
        const thankYouSection = this.thankYouSectionSubject.value;

        console.log('StudyStateService: Secciones actuales:', {
          welcomeSection,
          sections,
          thankYouSection
        });

        const allSections = [
          ...(welcomeSection ? [welcomeSection] : []),
          ...sections,
          ...(thankYouSection ? [thankYouSection] : [])
        ];

        console.log('StudyStateService: Guardando estudio con secciones:', allSections.length);
        await this.studyService.updateStudy(studyId, {
          ...study,
          sections: allSections,
          updatedAt: new Date()
        });
        console.log('StudyStateService: Guardado completado exitosamente');

        this.setLastSaved(new Date());
        this.snackBar.open('Cambios guardados', 'Cerrar', { duration: 2000 });
      } else {
        console.log('StudyStateService: No se encontró el estudio actual');
        throw new Error('No se encontró el estudio actual');
      }
    } catch (error) {
      console.error('StudyStateService: Error durante el guardado:', error);
      this.snackBar.open('Error al guardar los cambios', 'Cerrar', { duration: 3000 });
    } finally {
      console.log('StudyStateService: Finalizando guardado...');
      this.setSaving(false);
    }
  }

  requestSave() {
    this.saveRequested.next();
  }

  updateSection(section: Section) {
    switch (section.type) {
      case 'welcome-screen':
        this.setWelcomeSection(section as WelcomeScreenSection);
        break;
      case 'yes-no':
        this.setYesNoSection(section as YesNoSection);
        break;
      case 'open-question':
        this.setOpenQuestionSection(section as OpenQuestionSection);
        break;
      case 'multiple-choice':
        this.setMultipleChoiceSection(section as MultipleChoiceSection);
        break;
      case 'prototype-test':
        this.setPrototypeTestSection(section as PrototypeTestSection);
        break;
      case 'thank-you':
        this.setThankYouSection(section as ThankYouSection);
        break;
    }
  }
}
