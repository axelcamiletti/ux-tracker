import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Section, ThankYouSection } from '../../../models/section.model';

@Component({
  selector: 'app-thank-you-preview',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './thank-you-preview.component.html',
  styleUrls: ['./thank-you-preview.component.css']
})
export class ThankYouPreviewComponent {
  @Input() section!: ThankYouSection;

  previewData = {
    title: '',
    description: '',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.previewData = {
        title: this.section.title || 'No se ha ingresado el título',
        description: this.section.description || '',
      };
    }
  }
}
