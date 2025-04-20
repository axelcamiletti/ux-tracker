import { Component, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { YesNoSection } from '../../../models/section.model';

@Component({
  selector: 'app-yes-no-form',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatMenuModule, MatTooltipModule, FormsModule],
  templateUrl: './yes-no-form.component.html',
  styleUrl: './yes-no-form.component.css'
})
export class YesNoFormComponent {
  @Input() section!: YesNoSection;

  selectedOption: 'yes' | 'no' | null = null;

  formData = {
    title: '',
    description: '',
    required: false
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.formData = {
        title: this.section.title || 'No se ha ingresado el título',
        description: this.section.description || '',
        required: this.section.required || false
      };
      this.selectedOption = this.section.data.selectedOption as 'yes' | 'no' | null || null;
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
      selectedOption: option
    };
  }
}
