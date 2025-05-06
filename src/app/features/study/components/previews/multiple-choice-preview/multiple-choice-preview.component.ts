import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { MultipleChoiceSection } from '../../../models/section.model';
import { MultipleChoiceResponse } from '../../../models/study-response.model';
import { StudyStateService } from '../../../services/study-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-multiple-choice-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multiple-choice-preview.component.html',
  styleUrl: './multiple-choice-preview.component.css'
})
export class MultipleChoicePreviewComponent implements OnInit, OnDestroy {
  @Input() section!: MultipleChoiceSection;
  @Output() responseChange = new EventEmitter<MultipleChoiceResponse>();

  selectedOptions: string[] = [];
  private destroy$ = new Subject<void>();

  previewData = signal({
    title: '',
    description: '',
    required: false,
    allowMultiple: false,
    options: [] as { id: string; text: string }[]
  });

  private studyState = inject(StudyStateService);

  ngOnInit(): void {
    this.studyState.multipleChoiceSection$
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
      this.studyState.setMultipleChoiceSection(this.section);
    }
  }

  private updatePreviewData(section: MultipleChoiceSection) {
    this.previewData.set({
      title: section.title || '',
      description: section.description || '',
      required: section.required,
      allowMultiple: section.data.allowMultiple || false,
      options: section.data.options || []
    });
  }

  isSelected(optionId: string): boolean {
    return this.selectedOptions.includes(optionId);
  }

  toggleOption(optionId: string): void {
    if (this.previewData().allowMultiple) {
      const index = this.selectedOptions.indexOf(optionId);
      if (index === -1) {
        this.selectedOptions.push(optionId);
      } else {
        this.selectedOptions.splice(index, 1);
      }
    } else {
      this.selectedOptions = [optionId];
    }
    this.emitResponse();
  }

  private emitResponse() {
    const response: MultipleChoiceResponse = {
      sectionId: this.section.id,
      timestamp: new Date(),
      type: 'multiple-choice',
      response: {
        selectedOptionIds: this.selectedOptions
      }
    };
    this.responseChange.emit(response);
  }
}
