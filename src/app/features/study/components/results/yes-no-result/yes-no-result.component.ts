import { Component, Input, OnChanges } from '@angular/core';
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
export class YesNoResultComponent implements OnChanges {
  @Input() section!: Section;
  @Input() participants: StudyResponse[] = [];

  ngOnChanges() {
    console.log('YesNoResult: Input changes detectados');
    console.log('YesNoResult: Section recibida:', this.section);
    console.log('YesNoResult: Participantes recibidos:', this.participants);
  }

  getResponsesForSection(sectionId: string): StudyResponse[] {
    console.log('YesNoResult: Buscando respuestas para sección:', sectionId);
    const responses = this.participants.filter(participant =>
      participant.responses?.some(response => response.sectionId === sectionId)
    );
    console.log('YesNoResult: Respuestas encontradas:', responses.length);
    return responses;
  }

  getParticipantResponse(participant: StudyResponse, sectionId: string): string {
    const response = participant.responses?.find(r => r.sectionId === sectionId);
    if (response?.type === 'yes-no' && response.response?.answer !== undefined) {
      return response.response.answer ? 'Yes' : 'No';
    }
    return 'No response';
  }

  getYesNoStats(sectionId: string): { yes: number; no: number } {
    const responses = this.participants.flatMap(p => p.responses?.filter(r => r.sectionId === sectionId && r.type === 'yes-no') || []);
    return responses.reduce((acc, r) => {
      if (r.type === 'yes-no' && r.response?.answer !== undefined) {
        r.response.answer ? acc.yes++ : acc.no++;
      }
      return acc;
    }, { yes: 0, no: 0 });
  }
}
