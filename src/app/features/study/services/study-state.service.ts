import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Section } from '../models/section.model';

@Injectable({
  providedIn: 'root'
})
export class StudyStateService {
  private sections = new BehaviorSubject<Section[]>([]);
  private welcomeSection = new BehaviorSubject<Section | null>(null);
  private thankYouSection = new BehaviorSubject<Section | null>(null);
  private saveRequested = new Subject<void>();
  private saving = new BehaviorSubject<boolean>(false);
  private lastSaved = new BehaviorSubject<Date | null>(null);

  sections$ = this.sections.asObservable();
  welcomeSection$ = this.welcomeSection.asObservable();
  thankYouSection$ = this.thankYouSection.asObservable();
  saveRequested$ = this.saveRequested.asObservable();
  saving$ = this.saving.asObservable();
  lastSaved$ = this.lastSaved.asObservable();

  setSections(sections: Section[]) {
    this.sections.next(sections);
  }

  setWelcomeSection(section: Section) {
    this.welcomeSection.next(section);
  }

  setThankYouSection(section: Section) {
    this.thankYouSection.next(section);
  }

  setSaving(saving: boolean) {
    this.saving.next(saving);
  }

  setLastSaved(date: Date) {
    this.lastSaved.next(date);
  }

  requestSave() {
    this.setSaving(true);
    this.saveRequested.next();
  }

  completeSave() {
    this.setSaving(false);
    this.setLastSaved(new Date());
  }

  errorSave() {
    this.setSaving(false);
  }
} 