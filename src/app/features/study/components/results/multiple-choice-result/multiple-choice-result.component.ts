import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
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
export class MultipleChoiceResultComponent implements OnChanges {
  @Input() section!: Section;
  @Input() participants: StudyResponse[] = [];

  ngOnChanges() {
    console.log('MultipleChoiceResult: Input changes detectados');
    console.log('MultipleChoiceResult: Section recibida:', this.section);
    console.log('MultipleChoiceResult: Participantes recibidos:', this.participants);
  }

  getResponsesForSection(sectionId: string): StudyResponse[] {
    console.log('MultipleChoiceResult: Buscando respuestas para sección:', sectionId);
    const responses = this.participants.filter(participant =>
      participant.responses?.some(response => response.sectionId === sectionId)
    );
    console.log('MultipleChoiceResult: Respuestas encontradas:', responses.length);
    return responses;
  }

  getParticipantResponse(participant: StudyResponse, sectionId: string): string[] {
    const response = participant.responses?.find(r => r.sectionId === sectionId);
    if (response?.type === 'multiple-choice' && Array.isArray(response.response?.selectedOptionIds)) {
      return response.response.selectedOptionIds;
    }
    return [];
  }

  getOptionLabel(optionId: string): string {
    const option = (this.section as any).data?.options?.find((opt: any) => opt.id === optionId);
    return option?.label || 'Unknown option';
  }

  getOptionsStats(sectionId: string): Array<{ id: string; count: number; percentage: number }> {
    const total = this.participants.length;
    const stats: { [key: string]: number } = {};

    // Inicializar contador para cada opción
    (this.section as any).data?.options?.forEach((opt: any) => {
      stats[opt.id] = 0;
    });

    // Contar selecciones
    this.participants.forEach(participant => {
      const selectedIds = this.getParticipantResponse(participant, sectionId);
      selectedIds.forEach(id => {
        stats[id] = (stats[id] || 0) + 1;
      });
    });

    // Convertir a array con porcentajes
    return Object.entries(stats).map(([id, count]) => ({
      id,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }
}
