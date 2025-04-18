import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Section } from '../../../models/section.model';

@Component({
  selector: 'app-thank-you-preview',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './thank-you-preview.component.html',
  styleUrls: ['./thank-you-preview.component.css']
})
export class ThankYouPreviewComponent {
  @Input() section: Section | null = null;

  get previewData() {
    return this.section?.data || {
      title: '¡Gracias por tu participación!',
      subtitle: 'Tus respuestas han sido guardadas correctamente. ¡Apreciamos mucho tu tiempo y feedback!'
    };
  }
}
