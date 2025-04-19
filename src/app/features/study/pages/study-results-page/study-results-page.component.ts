import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { StudyService } from '../../services/study.service';
import { ParticipantResultService } from '../../services/participant-result.service';
import { Section } from '../../models/section.model';
import { ParticipantResult } from '../../models/participant-result.model';
import { ClipElementComponent } from "../../components/clip-element/clip-element.component";
import { ParticipantCardComponent } from "../../components/participant-card/participant-card.component";
import { OpenQuestionResultComponent } from "../../components/results/open-question-result/open-question-result.component";
import { YesNoResultComponent } from "../../components/results/yes-no-result/yes-no-result.component";
import { MultipleChoiceResultComponent } from "../../components/results/multiple-choice-result/multiple-choice-result.component";
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
  selector: 'app-study-results-page',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatIconModule, FormsModule, ClipElementComponent, ParticipantCardComponent, OpenQuestionResultComponent, YesNoResultComponent, MultipleChoiceResultComponent],
  templateUrl: './study-results-page.component.html',
  styleUrl: './study-results-page.component.css'
})
export class StudyResultsPageComponent implements OnInit {
  activeView: 'results' | 'participants' = 'results';
  sections: Section[] = [];
  selectedSection: Section | null = null;
  selectedParticipant: ParticipantResult | null = null;
  participants: ParticipantResult[] = [];
  studyId: string = '';

  constructor(
    private studyService: StudyService,
    private participantResultService: ParticipantResultService,
  ) {}

  ngOnInit() {
    this.loadSections();
    this.loadParticipants();
  }

  loadSections() {
    this.studyService.getCurrentStudy().subscribe({
      next: (study) => {
        if (study && study.sections) {
          this.sections = study.sections;
        } else {
          console.error('No se encontraron secciones en el estudio');
        }
      },
      error: (error) => {
        console.error('Error al cargar las secciones:', error);
      }
    });
  }

  loadParticipants() {
    this.participantResultService.getResultsByStudyId(this.studyId).subscribe({
      next: (results) => {
        this.participants = results;
      },
      error: (error) => {
        console.error('Error al cargar los participantes:', error);
      }
    });
  }

  getFilteredSections(): Section[] {
    return this.sections.filter(section => 
      section.type !== 'welcome-screen' && section.type !== 'thank-you'
    );
  }

  onViewChange(event: MatButtonToggleChange): void {
    this.activeView = event.value as 'results' | 'participants';
    this.selectedSection = null;
    this.selectedParticipant = null;
  }

  selectSection(section: Section): void {
    this.selectedSection = this.selectedSection?.id === section.id ? null : section;
  }

  selectParticipant(participant: ParticipantResult): void {
    this.selectedParticipant = this.selectedParticipant?.id === participant.id ? null : participant;
  }

  getParticipantResponses(sectionId: string): ParticipantResult['responses'] {
    if (!this.selectedParticipant) return [];
    return this.selectedParticipant.responses.filter(response => response.sectionId === sectionId);
  }
}
