import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ClipElementComponent } from '../../components/clip-element/clip-element.component';
import { ParticipantCardComponent } from '../../components/participant-card/participant-card.component';
import { OpenQuestionResultComponent } from '../../components/results/open-question-result/open-question-result.component';
import { YesNoResultComponent } from "../../components/results/yes-no-result/yes-no-result.component";
import { MultipleChoiceResultComponent } from "../../components/results/multiple-choice-result/multiple-choice-result.component";

@Component({
  selector: 'app-study-results-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatIconModule,
    ClipElementComponent,
    ParticipantCardComponent,
    OpenQuestionResultComponent,
    YesNoResultComponent,
    MultipleChoiceResultComponent
],
  templateUrl: './study-results-page.component.html',
  styleUrl: './study-results-page.component.css'
})
export class StudyResultsPageComponent {
  selectedSection: any = null;
  selectedParticipant: any = null;
  activeView: 'results' | 'participants' = 'results';

  sections = [
    { id: '1', type: 'open-question', data: { title: '¿Qué te pareció el diseño?' } },
    { id: '2', type: 'multiple-choice', data: { title: '¿Cuál es tu color favorito?' } }
  ];

  participants = [
    { id: '1', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: '2', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' }
  ];

  selectSection(section: any) {
    this.selectedSection = section;
    this.selectedParticipant = null;
  }

  selectParticipant(participant: any) {
    this.selectedParticipant = participant;
    this.selectedSection = null;
  }

  onViewChange(view: 'results' | 'participants') {
    this.activeView = view;
  }
}
