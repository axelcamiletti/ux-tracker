import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { WelcomeScreenSection } from '../../../models/section.model';

@Component({
  selector: 'app-welcome-screen-preview',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './welcome-screen-preview.component.html',
  styleUrl: './welcome-screen-preview.component.css'
})
export class WelcomeScreenPreviewComponent {
  @Input() section!: WelcomeScreenSection;

  previewData = {
    title: '',
    description: '',
    welcomeMessage: ''
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.previewData = {
        title: this.section.title || 'No se ha ingresado el título',
        description: this.section.description || '',
        welcomeMessage: this.section.data?.welcomeMessage || ''
      };
    }
  }
}
