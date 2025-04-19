import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudyResponse } from '../../models/study-response.model';

@Component({
  selector: 'app-participant-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './participant-card.component.html',
  styleUrl: './participant-card.component.css'
})
export class ParticipantCardComponent {
  @Input() participant!: StudyResponse;
  @Input() isActive: boolean = false;

  get title(): string {
    return `Participant ${this.participant.userId.slice(0, 8)}`;
  }

  get subtitle(): string {
    return this.participant.completedAt ? `Completed: ${this.participant.completedAt.toLocaleString()}` : 'In Progress';
  }

  get avatar(): string {
    // Generar un color aleatorio basado en el userId para el fondo del avatar
    const hash = this.participant.userId.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 30%)`;
  }
}
