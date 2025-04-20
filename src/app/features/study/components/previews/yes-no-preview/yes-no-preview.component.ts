import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { YesNoSection } from '../../../models/section.model';
import { YesNoResponse } from '../../../models/study-response.model';

type ButtonStyle = 'default' | 'emoji' | 'thumbs';

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
    required: false,
    yesLabel: '',
    noLabel: '',
    yesDescription: '',
    noDescription: '',
    buttonStyle: 'default' as ButtonStyle
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.previewData = {
        title: this.section.title || '',
        description: this.section.description || '',
        required: this.section.required,
        yesLabel: this.section.data.yesLabel || 'Sí',
        noLabel: this.section.data.noLabel || 'No',
        yesDescription: this.section.data.yesDescription || '',
        noDescription: this.section.data.noDescription || '',
        buttonStyle: this.section.data.buttonStyle || 'default'
      };
    }
  }

  selectOption(option: 'yes' | 'no') {
    this.selectedOption = option;
    this.emitResponse();
  }

  private emitResponse() {
    if (this.selectedOption) {
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
}
