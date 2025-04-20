import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { YesNoSection } from '../../../models/section.model';
import { YesNoResponse } from '../../../models/study-response.model';

@Component({
  selector: 'app-yes-no-preview',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './yes-no-preview.component.html',
  styleUrl: './yes-no-preview.component.css'
})
export class YesNoPreviewComponent {
  @Input() section!: YesNoSection;
  @Output() responseChange = new EventEmitter<YesNoResponse>();

  selectedOption: 'yes' | 'no' | null = null;

  previewData = {
    title: '',
    description: '',
    required: false
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.previewData = {
        title: this.section.title || 'No se ha ingresado el título',
        description: this.section.description || '',
        required: this.section.required || false
      };
    }
  }

  selectOption(option: 'yes' | 'no') {
    this.selectedOption = option;
    this.emitResponse();
  }

  private emitResponse() {
    const response: YesNoResponse = {
      sectionId: this.section.id,
      timestamp: new Date(),
      type: 'yes-no',
      response: {
        answer: this.selectedOption === 'yes'
      }
    };
    this.responseChange.emit(response);
  }
}
