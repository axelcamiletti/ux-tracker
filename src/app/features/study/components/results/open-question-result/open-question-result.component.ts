import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Section } from '../../../models/section.model';
import { ParticipantResult } from '../../../models/participant-result.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-open-question-result',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './open-question-result.component.html',
  styleUrl: './open-question-result.component.css'
})
export class OpenQuestionResultComponent {
  @Input() section!: Section;
  @Input() title: string = '';
  @Input() participants: ParticipantResult[] = [];

  getResponsesForSection(sectionId: string): ParticipantResult[] {
    return this.participants.filter(participant => 
      participant.responses.some(response => response.sectionId === sectionId)
    );
  }

  getParticipantResponse(participant: ParticipantResult, sectionId: string): string {
    const response = participant.responses.find(r => r.sectionId === sectionId);
    return response?.answer || '';
  }
}
