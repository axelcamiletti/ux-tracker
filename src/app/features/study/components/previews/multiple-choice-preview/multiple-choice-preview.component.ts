import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultipleChoiceSection } from '../../../models/section.model';
import { MultipleChoiceResponse } from '../../../models/study-response.model';

@Component({
  selector: 'app-multiple-choice-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multiple-choice-preview.component.html',
  styleUrl: './multiple-choice-preview.component.css'
})
export class MultipleChoicePreviewComponent {
  @Input() section!: MultipleChoiceSection;
  @Output() responseChange = new EventEmitter<MultipleChoiceResponse>();

  previewData = {
    title: '',
    description: '',
    options: [] as Array<{id: string, text: string}>,
    allowMultiple: false,
    required: false
  };

  selectedOptions: Set<string> = new Set();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.previewData = {
        title: this.section.title || 'No se ha ingresado la pregunta',
        description: this.section.description || '',
        options: this.section.data?.options || [],
        allowMultiple: this.section.data?.allowMultiple || false,
        required: this.section.required || false
      };
    }
  }

  toggleOption(optionId: string): void {
    if (!this.previewData.allowMultiple) {
      this.selectSingleOption(optionId);
    } else {
      if (this.selectedOptions.has(optionId)) {
        this.selectedOptions.delete(optionId);
      } else {
        this.selectedOptions.add(optionId);
      }
    }
    this.emitResponse();
  }

  selectSingleOption(optionId: string): void {
    this.selectedOptions.clear();
    this.selectedOptions.add(optionId);
    this.emitResponse();
  }

  isSelected(optionId: string): boolean {
    return this.selectedOptions.has(optionId);
  }

  private emitResponse(): void {
    const response: MultipleChoiceResponse = {
      sectionId: this.section.id,
      timestamp: new Date(),
      type: 'multiple-choice',
      response: {
        selectedOptionIds: Array.from(this.selectedOptions)
      }
    };
    this.responseChange.emit(response);
  }
}
