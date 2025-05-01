import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { StudyResponse, SectionResponse, PrototypeTestResponse, OpenQuestionResponse, YesNoResponse, MultipleChoiceResponse } from '../../../models/study-response.model';
import { Section } from '../../../models/section.model';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-participant-result',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, CommonModule, MatTooltipModule],
  templateUrl: './participant-result.component.html',
  styleUrl: './participant-result.component.css'
})
export class ParticipantResultComponent {
  @Input() participant!: StudyResponse;
  @Input() sections: Section[] = [];
  isExpanded = false;

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  getSectionTitle(sectionId: string): string {
    const section = this.sections.find(s => s.id === sectionId);
    return section?.title || `Question ${sectionId}`;
  }

  getOpenQuestionText(response: SectionResponse): string {
    if (response.type === 'open-question') {
      return (response as OpenQuestionResponse).response?.text || 'No response';
    }
    return 'Invalid response type';
  }

  getYesNoAnswer(response: SectionResponse): string {
    if (response.type === 'yes-no') {
      return (response as YesNoResponse).response?.answer ? 'Yes' : 'No';
    }
    return 'Invalid response type';
  }

  getMultipleChoiceOptions(response: SectionResponse): string[] {
    if (response.type === 'multiple-choice') {
      return (response as MultipleChoiceResponse).response?.selectedOptionIds || [];
    }
    return [];
  }

  getPrototypeTestInfo(response: SectionResponse): { completed: boolean; timeSpent: number; interactions: any[] } {
    if (response.type === 'prototype-test') {
      const testResponse = response as PrototypeTestResponse;
      /* return {
        completed: testResponse.response?.completed || false,
        timeSpent: testResponse.response?.timeSpent || 0,
        interactions: testResponse.response?.interactions || []
      }; */
    }
    return { completed: false, timeSpent: 0, interactions: [] };
  }
}
