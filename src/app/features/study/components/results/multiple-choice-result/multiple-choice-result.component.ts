import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Section } from '../../../models/section.model';
import { StudyResponse } from '../../../models/study-response.model';

@Component({
  selector: 'app-multiple-choice-result',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './multiple-choice-result.component.html',
  styleUrl: './multiple-choice-result.component.css'
})
export class MultipleChoiceResultComponent {
  @Input() section!: Section;
  @Input() participants: StudyResponse[] = [];

  getResponsesForSection(sectionId: string): StudyResponse[] {
    return this.participants.filter(participant =>
      participant.responses.some(response => response.sectionId === sectionId)
    );
  }

  getParticipantResponse(participant: StudyResponse, sectionId: string): string {
    const response = participant.responses.find(r => r.sectionId === sectionId);
    return response?.response || '';
  }
}
