import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Section } from '../../../models/section.model';
import { OpenQuestionData } from '../../../models/open-question.model';

@Component({
  selector: 'app-open-question-preview',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './open-question-preview.component.html',
  styleUrl: './open-question-preview.component.css'
})
export class OpenQuestionPreviewComponent {
  @Input() section: Section | null = null;
  @Output() responseChange = new EventEmitter<string>();

  previewData: OpenQuestionData = {
    title: '',
    subtitle: '',
  };

  response: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.previewData = this.section.data || {
        title: 'No se ha ingresado la pregunta',
        subtitle: ''
      };

      // Restaurar respuesta guardada si existe
      if (this.section.response) {
        this.response = this.section.response;
      }
    }
  }

  onResponseChange(value: string) {
    this.response = value;
    this.responseChange.emit(value);
  }
}
