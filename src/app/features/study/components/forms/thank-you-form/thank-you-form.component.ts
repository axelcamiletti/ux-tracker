import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ThankYouSection } from '../../../models/section.model';

@Component({
  selector: 'app-thank-you-form',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatMenuModule, MatTooltipModule, FormsModule],
  templateUrl: './thank-you-form.component.html',
  styleUrl: './thank-you-form.component.css'
})
export class ThankYouFormComponent {
  @Input() section!: ThankYouSection;

  formData = {
    title: '',
    description: '',
    imageUrl: ''
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.formData = {
        title: this.section.title || '',
        description: this.section.description || '',
        imageUrl: this.section.data?.imageUrl || ''
      };
    }
  }

  onTitleChange(newTitle: string): void {
    this.formData.title = newTitle;
    this.section.title = newTitle;
  }

  onDescriptionChange(newDescription: string): void {
    this.formData.description = newDescription;
    this.section.description = newDescription;
  }

  onImageUrlChange(newImageUrl: string): void {
    this.formData.imageUrl = newImageUrl;
    this.section.data = {
      ...this.section.data,
      imageUrl: newImageUrl
    };
  }
}
