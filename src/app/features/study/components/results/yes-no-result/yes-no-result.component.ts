import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Section } from '../../../models/section.model';
import { StudyResponse } from '../../../models/study-response.model';

@Component({
  selector: 'app-yes-no-result',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './yes-no-result.component.html',
  styleUrl: './yes-no-result.component.css'
})
export class YesNoResultComponent {
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
