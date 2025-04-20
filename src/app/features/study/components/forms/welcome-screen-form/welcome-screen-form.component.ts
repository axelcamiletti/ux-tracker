import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { WelcomeScreenSection } from '../../../models/section.model';

@Component({
  selector: 'app-welcome-screen-form',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatMenuModule, MatTooltipModule, FormsModule],
  templateUrl: './welcome-screen-form.component.html',
  styleUrl: './welcome-screen-form.component.css'
})
export class WelcomeScreenFormComponent {
  @Input() section!: WelcomeScreenSection;

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

  onLogoUrlChange(newImageUrl: string): void {
    this.formData.imageUrl = newImageUrl;
    this.section.data = {
      welcomeMessage: this.section.data?.welcomeMessage || '',
      imageUrl: newImageUrl
    };
  }
}
