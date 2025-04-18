import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Section } from '../../../models/section.model';

@Component({
  selector: 'app-prototype-test-preview',
  imports: [MatButtonModule],
  templateUrl: './prototype-test-preview.component.html',
  styleUrl: './prototype-test-preview.component.css'
})
export class PrototypeTestPreviewComponent {
  @Input() section!: Section;

}
