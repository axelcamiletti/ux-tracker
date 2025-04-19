import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-participant-card',
  imports: [CommonModule, MatIconModule, MatMenuModule, MatButtonModule],
  templateUrl: './participant-card.component.html',
  styleUrl: './participant-card.component.css'
})
export class ParticipantCardComponent {
  @Input() isActive: boolean = false;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() avatar?: string;
}
