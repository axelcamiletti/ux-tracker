import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OpenQuestionSection } from '../../../models/section.model';
import { OpenQuestionResponse } from '../../../models/study-response.model';
import { StudyStateService } from '../../../services/study-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-open-question-preview',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './open-question-preview.component.html',
  styleUrl: './open-question-preview.component.css'
})
export class OpenQuestionPreviewComponent implements OnInit, OnDestroy {
  @Input() section!: OpenQuestionSection;
  @Output() responseChange = new EventEmitter<OpenQuestionResponse>();

  response: string = '';
  private destroy$ = new Subject<void>();

  previewData = signal({
    title: '',
    description: '',
    minLength: undefined as number | undefined,
    maxLength: undefined as number | undefined,
    required: false
  });

  private studyState = inject(StudyStateService);

  ngOnInit(): void {
    this.studyState.openQuestionSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        if (section) {
          this.updatePreviewData(section);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.updatePreviewData(this.section);
      this.studyState.setOpenQuestionSection(this.section);
    }
  }

  private updatePreviewData(section: OpenQuestionSection) {
    this.previewData.set({
      title: section.title || 'No se ha ingresado el título',
      description: section.description || '',
      minLength: section.data.minLength,
      maxLength: section.data.maxLength,
      required: section.required
    });
  }

  onResponseChange(value: string) {
    this.response = value;
    this.emitResponse();
  }

  private emitResponse() {
    const response: OpenQuestionResponse = {
      sectionId: this.section.id,
      timestamp: new Date(),
      type: 'open-question',
      response: {
        text: this.response
      }
    };
    this.responseChange.emit(response);
  }
}
