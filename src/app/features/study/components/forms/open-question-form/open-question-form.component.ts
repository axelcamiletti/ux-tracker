import { Component, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenQuestionSection } from '../../../models/section.model';

@Component({
  selector: 'app-open-question-form',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatMenuModule, MatTooltipModule, FormsModule],
  templateUrl: './open-question-form.component.html',
  styleUrl: './open-question-form.component.css'
})
export class OpenQuestionFormComponent {
  @Input() section!: OpenQuestionSection;

  formData = {
    title: '',
    description: '',
    required: false,
    placeholder: '',
    minLength: undefined as number | undefined,
    maxLength: undefined as number | undefined
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.formData = {
        title: this.section.title || '',
        description: this.section.description || '',
        required: this.section.required || false,
        placeholder: this.section.data.placeholder || '',
        minLength: this.section.data.minLength,
        maxLength: this.section.data.maxLength
      };
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

  onPlaceholderChange(newPlaceholder: string): void {
    this.formData.placeholder = newPlaceholder;
    this.section.data = {
      ...this.section.data,
      placeholder: newPlaceholder
    };
  }

  onMinLengthChange(newMinLength: number | undefined): void {
    this.formData.minLength = newMinLength;
    this.section.data = {
      ...this.section.data,
      minLength: newMinLength
    };
  }

  onMaxLengthChange(newMaxLength: number | undefined): void {
    this.formData.maxLength = newMaxLength;
    this.section.data = {
      ...this.section.data,
      maxLength: newMaxLength
    };
  }
}
