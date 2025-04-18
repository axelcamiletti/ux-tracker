import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Section } from '../../../models/section.model';
import { MultipleChoiceData } from '../../../models/multiple-choice.model';

@Component({
  selector: 'app-multiple-choice-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multiple-choice-preview.component.html',
  styleUrl: './multiple-choice-preview.component.css'
})
export class MultipleChoicePreviewComponent {
  @Input() section: Section | null = null;
  @Output() responseChange = new EventEmitter<any>();

  previewData: MultipleChoiceData = {
    title: '',
    subtitle: '',
    selectionType: 'single',
    options: []
  };

  selectedOptions: Set<number> = new Set();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.previewData = this.section.data || {
        title: 'No se ha ingresado la pregunta',
        subtitle: '',
        selectionType: 'single',
        options: []
      };

      // Restaurar respuesta guardada si existe
      if (this.section.response) {
        this.selectedOptions = new Set(this.section.response);
        this.emitResponse();
      }
    }
  }

  toggleOption(optionId: number): void {
    if (this.previewData.selectionType === 'single') {
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

  selectSingleOption(optionId: number): void {
    this.selectedOptions.clear();
    this.selectedOptions.add(optionId);
    this.emitResponse();
  }

  isSelected(optionId: number): boolean {
    return this.selectedOptions.has(optionId);
  }

  private emitResponse(): void {
    this.responseChange.emit(Array.from(this.selectedOptions));
  }
}
