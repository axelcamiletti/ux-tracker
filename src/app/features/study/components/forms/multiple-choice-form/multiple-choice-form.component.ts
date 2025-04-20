import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MultipleChoiceSection } from '../../../models/section.model';

@Component({
  selector: 'app-multiple-choice-form',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatFormFieldModule, MatMenuModule, MatTooltipModule, FormsModule, MatIconModule, MatRadioModule, MatButtonModule],
  templateUrl: './multiple-choice-form.component.html',
  styleUrl: './multiple-choice-form.component.css'
})
export class MultipleChoiceFormComponent {
  @Input() section!: MultipleChoiceSection;

  optionCounter = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      if (!this.section.data.options || this.section.data.options.length === 0) {
        this.section.data.options = [{
          id: String(this.optionCounter++),
          text: ''
        }];
      }
    }
  }

  onTitleChange(newTitle: string): void {
    this.section.title = newTitle;
  }

  onDescriptionChange(newDescription: string): void {
    this.section.description = newDescription;
  }

  updateAllowMultiple(allow: boolean): void {
    if (this.section.data) {
      this.section.data.allowMultiple = allow;
    }
  }

  addOption(): void {
    if (this.section.data) {
      this.section.data.options.push({
        id: String(this.optionCounter++),
        text: ''
      });
    }
  }

  removeOption(id: string): void {
    if (this.section.data && this.section.data.options.length > 1) {
      this.section.data.options = this.section.data.options.filter(opt => opt.id !== id);
    }
  }

  updateOptionText(id: string, text: string): void {
    if (this.section.data) {
      const option = this.section.data.options.find(opt => opt.id === id);
      if (option) {
        option.text = text;
      }
    }
  }
}
