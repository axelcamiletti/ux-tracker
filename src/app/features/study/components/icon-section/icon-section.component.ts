import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-icon-section',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './icon-section.component.html',
  styleUrl: './icon-section.component.css'
})
export class IconSectionComponent {
  @Input() type: string = '';
}
