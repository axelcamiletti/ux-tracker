import { Component, Input, Output, EventEmitter, SimpleChanges, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { WelcomeScreenSection } from '../../../models/section.model';
import { StudyStateService } from '../../../services/study-state.service';
import { Subject, takeUntil } from 'rxjs';
import { IconSectionComponent } from "../../icon-section/icon-section.component";

@Component({
  selector: 'app-welcome-screen-form',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatMenuModule, MatTooltipModule, FormsModule, IconSectionComponent],
  templateUrl: './welcome-screen-form.component.html',
  styleUrl: './welcome-screen-form.component.css'
})
export class WelcomeScreenFormComponent implements OnInit, OnDestroy {
  @Input() section!: WelcomeScreenSection;
  @Output() sectionChange = new EventEmitter<WelcomeScreenSection>();

  formData = signal({
    title: '',
    description: '',
  });

  private destroy$ = new Subject<void>();
  private studyState = inject(StudyStateService);

  ngOnInit() {
    this.studyState.welcomeSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        if (section) {
          this.updateFormData(section);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.updateFormData(this.section);
      this.studyState.setWelcomeSection(this.section);
    }
  }

  private updateFormData(section: WelcomeScreenSection): void {
    this.formData.set({
      title: section.title || '',
      description: section.description || '',
    });
  }

  onTitleChange(newTitle: string): void {
    this.formData.update(current => ({
      ...current,
      title: newTitle
    }));

    this.section.title = newTitle;
    this.studyState.setWelcomeSection({...this.section});
    this.sectionChange.emit(this.section);
  }

  onDescriptionChange(newDescription: string): void {
    this.formData.update(current => ({
      ...current,
      description: newDescription
    }));

    this.section.description = newDescription;
    this.studyState.setWelcomeSection({...this.section});
    this.sectionChange.emit(this.section);
  }
}
