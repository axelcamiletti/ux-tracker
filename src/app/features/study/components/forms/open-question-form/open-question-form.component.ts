import { Component, Input, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenQuestionSection } from '../../../models/section.model';
import { StudyStateService } from '../../../services/study-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-open-question-form',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatMenuModule, MatTooltipModule, FormsModule],
  templateUrl: './open-question-form.component.html',
  styleUrl: './open-question-form.component.css'
})
export class OpenQuestionFormComponent implements OnInit, OnDestroy {
  @Input() section!: OpenQuestionSection;

  private destroy$ = new Subject<void>();

  formData = {
    title: '',
    description: '',
    required: false,
    placeholder: '',
    minLength: undefined as number | undefined,
    maxLength: undefined as number | undefined
  };

  constructor(private studyState: StudyStateService) {}

  ngOnInit() {
    this.studyState.openQuestionSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        if (section) {
          this.updateFormDataFromSection(section);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.updateFormDataFromSection(this.section);
      this.studyState.setOpenQuestionSection(this.section);
    }
  }

  private updateFormDataFromSection(section: OpenQuestionSection) {
    this.formData = {
      title: section.title || '',
      description: section.description || '',
      required: section.required || false,
      placeholder: section.data.placeholder || '',
      minLength: section.data.minLength,
      maxLength: section.data.maxLength
    };
  }

  onTitleChange(newTitle: string): void {
    this.formData.title = newTitle;
    this.section.title = newTitle;
    this.studyState.setOpenQuestionSection(this.section);
  }

  onSubtitleChange(newDescription: string): void {
    this.formData.description = newDescription;
    this.section.description = newDescription;
    this.studyState.setOpenQuestionSection(this.section);
  }

  onPlaceholderChange(newPlaceholder: string): void {
    this.formData.placeholder = newPlaceholder;
    this.section.data = {
      ...this.section.data,
      placeholder: newPlaceholder
    };
    this.studyState.setOpenQuestionSection(this.section);
  }

  onMinLengthChange(newMinLength: number | undefined): void {
    this.formData.minLength = newMinLength;
    this.section.data = {
      ...this.section.data,
      minLength: newMinLength
    };
    this.studyState.setOpenQuestionSection(this.section);
  }

  onMaxLengthChange(newMaxLength: number | undefined): void {
    this.formData.maxLength = newMaxLength;
    this.section.data = {
      ...this.section.data,
      maxLength: newMaxLength
    };
    this.studyState.setOpenQuestionSection(this.section);
  }
}
