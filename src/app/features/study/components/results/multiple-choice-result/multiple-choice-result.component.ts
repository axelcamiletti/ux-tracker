import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Section } from '../../../models/section.model';
import { ParticipantResult } from '../../../models/participant-result.model';

@Component({
  selector: 'app-multiple-choice-result',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './multiple-choice-result.component.html',
  styleUrl: './multiple-choice-result.component.css'
})
export class MultipleChoiceResultComponent {
  @Input() section!: Section;
  @Input() title: string = '';
  @Input() participants: ParticipantResult[] = [];

  options = [
    { name: 'Lagarto' },
    { name: 'Perrito faldero' },
    { name: 'Gatito chato' }
  ];

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
