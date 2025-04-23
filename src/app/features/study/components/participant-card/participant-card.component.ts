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
    try {
      const userId = this.participant?.userId || 'Unknown';
      // Simplemente tomar los primeros 8 caracteres sin codificación
      const shortId = userId.substring(0, 8);
      return `Participant ${shortId}`;
    } catch (error) {
      console.warn('Error generating participant title:', error);
      return 'Participant';
    }
  }

  get subtitle(): string {
    try {
      if (!this.participant?.completedAt) {
        return 'In Progress';
      }
      const date = new Date(this.participant.completedAt);
      return `Completed: ${date.toLocaleString()}`;
    } catch (error) {
      console.warn('Error generating participant subtitle:', error);
      return 'Status unknown';
    }
  }
}
