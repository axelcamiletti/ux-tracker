import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Section } from '../../../models/section.model';
import { StudyResponse } from '../../../models/study-response.model';
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
  @Input() participants: StudyResponse[] = [];

  getResponsesForSection(sectionId: string): StudyResponse[] {
    const responses = this.participants.filter(participant =>
      participant.responses?.some(response => response.sectionId === sectionId)
    );
    return responses;
  }

  getParticipantResponse(participant: StudyResponse, sectionId: string): string {
    const response = participant.responses?.find(r => r.sectionId === sectionId);
    if (response?.type === 'open-question' && response.response?.text) {
      return response.response.text;
    }
    return 'No response';
  }
}
