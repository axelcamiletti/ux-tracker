import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { StudyResponsesService } from '../../services/study-responses.service';
import { StudyService } from '../../services/study.service';
import { Section } from '../../models/section.model';
import { SectionAnalytics, StudyAnalytics } from '../../models/study-response.model';
import { Study } from '../../models/study.model';

@Component({
  selector: 'app-study-analytics-page',
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule
  ],
  templateUrl: './study-analytics-page.component.html',
  styleUrl: './study-analytics-page.component.css'
})
export class StudyAnalyticsPageComponent implements OnInit {
  study: Study | null = null;
  loading = true;
  studyId: string = '';
  analytics: StudyAnalytics | null = null;
  sections: Section[] = [];
  error: string | null = null;

  // Datos mockeados para desarrollo
  private mockSections: Section[] = [
    {
      id: '1',
      type: 'yes-no',
      data: { title: '¿Te pareció útil el producto?' }
    },
    {
      id: '2',
      type: 'multiple-choice',
      data: {
        title: '¿Qué características te gustaron más?',
        options: [
          { id: 'opt1', label: 'Facilidad de uso' },
          { id: 'opt2', label: 'Diseño visual' },
          { id: 'opt3', label: 'Velocidad' }
        ]
      }
    },
    {
      id: '3',
      type: 'open-question',
      data: { title: '¿Qué sugerencias tienes para mejorar?' }
    }
  ];

  private mockAnalytics: StudyAnalytics = {
    totalResponses: 50,
    completionRate: 85,
    averageTimeSpent: 300000, // 5 minutos en milisegundos
    sectionAnalytics: {
      '1': {
        totalResponses: 50,
        responses: [],
        yesNoDistribution: {
          yes: 35,
          no: 15
        }
      },
      '2': {
        totalResponses: 50,
        responses: [],
        optionDistribution: {
          'opt1': 30,
          'opt2': 25,
          'opt3': 20
        }
      },
      '3': {
        totalResponses: 45,
        responses: [],
        commonKeywords: [
          { word: 'interfaz', count: 15 },
          { word: 'rápido', count: 12 },
          { word: 'intuitivo', count: 10 },
          { word: 'mejorar', count: 8 }
        ]
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studyService: StudyService,
    private studyResponsesService: StudyResponsesService
  ) {}

  ngOnInit() {
    this.studyId = this.route.parent?.snapshot.paramMap.get('id') || '';
    if (this.studyId) {
      this.loadStudy();
    } else {
      this.router.navigate(['/projects']);
    }
  }

  private loadStudy() {
    this.loading = true;
    this.studyService.getStudyById(this.studyId).subscribe({
      next: (study) => {
        this.study = study;
        this.loadAnalytics();
      },
      error: (error) => {
        console.error('Error loading study:', error);
        this.router.navigate(['/projects']);
      }
    });
  }

  private async loadAnalytics() {
    try {
      this.loading = true;
      this.error = null;

      // Usar datos mockeados en lugar de llamar a los servicios
      setTimeout(() => {
        this.sections = this.mockSections;
        this.analytics = this.mockAnalytics;
        this.loading = false;
      }, 1000); // Simulamos 1 segundo de carga

    } catch (err) {
      this.error = 'Error al cargar las analíticas';
      console.error(err);
      this.loading = false;
    }
  }

  getSectionTitle(sectionId: string): string {
    const section = this.sections.find(s => s.id === sectionId);
    return section?.data?.title || 'Sección sin título';
  }

  formatTimeSpent(ms: number): string {
    const minutes = Math.floor(ms / (1000 * 60));
    return `${minutes} minutos`;
  }

  getResponseDistribution(sectionId: string): any {
    const sectionAnalytics = this.analytics?.sectionAnalytics[sectionId];
    if (!sectionAnalytics) return null;

    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return null;

    switch (section.type) {
      case 'yes-no':
        return sectionAnalytics.yesNoDistribution;
      case 'multiple-choice':
        return this.formatMultipleChoiceDistribution(section, sectionAnalytics);
      case 'open-question':
        return sectionAnalytics.commonKeywords;
      default:
        return null;
    }
  }

  private formatMultipleChoiceDistribution(section: Section, analytics: SectionAnalytics): any[] {
    const distribution = analytics.optionDistribution || {};
    return section.data.options.map((option: { label: string; id: string }) => ({
      label: option.label,
      count: distribution[option.id] || 0,
      percentage: ((distribution[option.id] || 0) / analytics.totalResponses) * 100
    }));
  }
}
