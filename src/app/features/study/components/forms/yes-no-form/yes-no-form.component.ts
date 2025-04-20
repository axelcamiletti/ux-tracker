import { Component, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { YesNoSection } from '../../../models/section.model';

type ButtonStyle = 'default' | 'emoji' | 'thumbs';

@Component({
  selector: 'app-yes-no-form',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './yes-no-form.component.html',
  styleUrl: './yes-no-form.component.css'
})
export class YesNoFormComponent {
  @Input() section!: YesNoSection;

  selectedOption: 'yes' | 'no' | null = null;

  formData = {
    title: '',
    description: '',
    required: false,
    yesLabel: 'Sí',
    noLabel: 'No',
    yesDescription: '',
    noDescription: '',
    buttonStyle: 'default' as ButtonStyle
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.formData = {
        title: this.section.title || 'Title not entered',
        description: this.section.description || '',
        required: this.section.required || false,
        yesLabel: this.section.data.yesLabel || 'Sí',
        noLabel: this.section.data.noLabel || 'No',
        yesDescription: this.section.data.yesDescription || '',
        noDescription: this.section.data.noDescription || '',
        buttonStyle: this.section.data.buttonStyle || 'default'
      };
      this.selectedOption = this.section.data.selectedOption || null;
    }
  }

  onTitleChange(newTitle: string): void {
    this.formData.title = newTitle;
    this.section.title = newTitle;
  }

  onSubtitleChange(newDescription: string): void {
    this.formData.description = newDescription;
    this.section.description = newDescription;
  }

  onSelectedOptionChange(option: 'yes' | 'no'): void {
    this.selectedOption = option;
    this.section.data = {
      ...this.section.data,
      selectedOption: option
    };
  }

  onLabelChange(type: 'yes' | 'no', value: string): void {
    if (type === 'yes') {
      this.formData.yesLabel = value;
      this.section.data = {
        ...this.section.data,
        yesLabel: value
      };
    } else {
      this.formData.noLabel = value;
      this.section.data = {
        ...this.section.data,
        noLabel: value
      };
    }
  }

  onDescriptionChange(type: 'yes' | 'no', value: string): void {
    if (type === 'yes') {
      this.formData.yesDescription = value;
      this.section.data = {
        ...this.section.data,
        yesDescription: value
      };
    } else {
      this.formData.noDescription = value;
      this.section.data = {
        ...this.section.data,
        noDescription: value
      };
    }
  }

  onButtonStyleChange(style: ButtonStyle): void {
    this.formData.buttonStyle = style;
    this.section.data = {
      ...this.section.data,
      buttonStyle: style
    };
  }
}
