import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Section } from '../../models/section.model';

@Component({
  selector: 'app-clip-element',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, MatButtonModule],
  templateUrl: './clip-element.component.html',
  styleUrl: './clip-element.component.css'
})
export class ClipElementComponent {
  @Input() isActive: boolean = false;
  @Input() type: Section['type'] = 'open-question';
  @Input() title?: string;
  @Output() delete = new EventEmitter<void>();

  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit();
  }
}
