import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OpenQuestionSection } from '../../../models/section.model';
import { OpenQuestionResponse } from '../../../models/study-response.model';

@Component({
  selector: 'app-open-question-preview',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './open-question-preview.component.html',
  styleUrl: './open-question-preview.component.css'
})
export class OpenQuestionPreviewComponent {
  @Input() section!: OpenQuestionSection;
  @Output() responseChange = new EventEmitter<OpenQuestionResponse>();

  response: string = '';

  previewData = {
    title: '',
    description: '',
    placeholder: '',
    minLength: undefined as number | undefined,
    maxLength: undefined as number | undefined,
    required: false
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.previewData = {
        title: this.section.title || 'No se ha ingresado el título',
        description: this.section.description || '',
        placeholder: this.section.data.placeholder || '',
        minLength: this.section.data.minLength,
        maxLength: this.section.data.maxLength,
        required: this.section.required
      };
    }
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
