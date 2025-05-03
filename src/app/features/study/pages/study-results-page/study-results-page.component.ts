import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { StudyService } from '../../services/study.service';
import { StudyResponsesService } from '../../services/study-responses.service';
import { Section } from '../../models/section.model';
import { StudyResponse } from '../../models/study-response.model';
import { ClipElementComponent } from "../../components/clip-element/clip-element.component";
import { ParticipantCardComponent } from "../../components/participant-card/participant-card.component";
import { OpenQuestionResultComponent } from "../../components/results/open-question-result/open-question-result.component";
import { YesNoResultComponent } from "../../components/results/yes-no-result/yes-no-result.component";
import { MultipleChoiceResultComponent } from "../../components/results/multiple-choice-result/multiple-choice-result.component";
import { ParticipantResultComponent } from "../../components/results/participant-result/participant-result.component";
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ActivatedRoute } from '@angular/router';
import { inject } from '@angular/core';
import { StudyAnalyticsService } from '../../services/study-analytics.service';
import { PrototypeTestResultComponent } from "../../components/results/prototype-test-result/prototype-test-result.component";

@Component({
  selector: 'app-study-results-page',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatIconModule, FormsModule, ClipElementComponent, ParticipantCardComponent, OpenQuestionResultComponent, YesNoResultComponent, MultipleChoiceResultComponent, ParticipantResultComponent, PrototypeTestResultComponent],
  templateUrl: './study-results-page.component.html',
  styleUrl: './study-results-page.component.css'
})
export class StudyResultsPageComponent implements OnInit {
  activeView: 'results' | 'participants' = 'results';
  sections: Section[] = [];
  selectedSection: Section | null = null;
  selectedParticipant: StudyResponse | null = null;
  participants: StudyResponse[] = [];
  studyId: string = '';

  private studyService = inject(StudyService);
  private studyResponsesService = inject(StudyResponsesService);
  private studyAnalyticsService = inject(StudyAnalyticsService);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.studyId = this.route.parent?.snapshot.paramMap.get('id') || '';

    if (this.studyId) {
      this.loadSections();
      this.loadParticipants();
    } else {
      console.error('StudyResultsPage: No se encontró el ID del estudio en la URL');
    }
  }

  loadSections() {
    this.studyService.getCurrentStudy().subscribe({
      next: (study) => {
        if (study && study.sections) {
          this.sections = study.sections;
        } else {
          console.error('StudyResultsPage: No se encontraron secciones en el estudio');
        }
      },
      error: (error) => {
        console.error('StudyResultsPage: Error al cargar las secciones:', error);
      }
    });
  }

  async loadParticipants() {
    try {
      // Primero cargar las respuestas completadas
      const responses = await this.studyResponsesService.getCompletedStudyResponses(this.studyId);
      this.participants = responses;

    } catch (error) {
      console.error('StudyResultsPage: Error al cargar los participantes:', error);
      this.participants = []; // Asegurarnos de que siempre sea un array
    }
  }

  getFilteredSections(): Section[] {
    return this.sections.filter(section =>
      section.type !== 'welcome-screen' && section.type !== 'thank-you'
    );
  }

  onViewChange(event: MatButtonToggleChange): void {
    try {
      this.activeView = event.value as 'results' | 'participants';
      this.selectedSection = null;
      this.selectedParticipant = null;
    } catch (error) {
      console.error('Error changing view:', error);
      this.activeView = 'results'; // fallback to default view
    }
  }

  selectSection(section: Section): void {
    this.selectedSection = this.selectedSection?.id === section.id ? null : section;
  }

  selectParticipant(participant: StudyResponse): void {
    try {
      if (!participant?.id) {
        console.warn('Invalid participant selected:', participant);
        return;
      }
      this.selectedParticipant = this.selectedParticipant?.id === participant.id ? null : participant;
    } catch (error) {
      console.error('Error selecting participant:', error);
    }
  }

  getParticipantResponses(sectionId: string): StudyResponse['responses'] {
    try {
      if (!this.selectedParticipant?.responses) {
        return [];
      }
      return this.selectedParticipant.responses.filter(response =>
        response && response.sectionId === sectionId
      );
    } catch (error) {
      console.error('Error getting participant responses:', error);
      return [];
    }
  }
}
