import { Component, Input, Output, EventEmitter, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { PrototypeTestSection } from '../../../models/section.model';
import { PrototypeTestResponse } from '../../../models/study-response.model';
import { StudyStateService } from '../../../services/study-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-prototype-test-preview',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './prototype-test-preview.component.html',
  styleUrl: './prototype-test-preview.component.css'
})
export class PrototypeTestPreviewComponent implements OnInit, OnDestroy {
  @Input() section!: PrototypeTestSection;
  @Output() responseChange = new EventEmitter<PrototypeTestResponse>();

  private destroy$ = new Subject<void>();

  previewData = {
    title: '',
    description: '',
    prototypeUrl: '',
    instructions: '',
    timeLimit: undefined as number | undefined,
    interactionTracking: {
      enabled: false,
      trackClicks: false,
      trackMouseMovement: false,
      trackScrolling: false,
      trackKeyboard: false,
      elements: [] as { selector: string; name: string }[]
    }
  };

  constructor(private studyState: StudyStateService) {}

  ngOnInit(): void {
    this.studyState.prototypeTestSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        if (section) {
          this.updatePreviewData(section);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.updatePreviewData(this.section);
      this.studyState.setPrototypeTestSection(this.section);
    }
  }

  private updatePreviewData(section: PrototypeTestSection) {
    this.previewData = {
      title: section.title || '',
      description: section.description || '',
      prototypeUrl: section.data.prototypeUrl || '',
      instructions: section.data.instructions || '',
      timeLimit: section.data.timeLimit,
      interactionTracking: {
        enabled: section.data.interactionTracking?.enabled || false,
        trackClicks: section.data.interactionTracking?.trackClicks || false,
        trackMouseMovement: section.data.interactionTracking?.trackMouseMovement || false,
        trackScrolling: section.data.interactionTracking?.trackScrolling || false,
        trackKeyboard: section.data.interactionTracking?.trackKeyboard || false,
        elements: (section.data.interactionTracking?.elements || []).map(e => ({
          selector: e.selector,
          name: e.description // Map description to name
        }))
      }
    };
  }

  onTestComplete(timeSpent: number, interactions?: Array<{ elementId: string; action: string; timestamp: Date }>) {
    const response: PrototypeTestResponse = {
      sectionId: this.section.id,
      timestamp: new Date(),
      type: 'prototype-test',
      response: {
        completed: true,
        timeSpent,
        interactions
      }
    };
    this.responseChange.emit(response);
  }
}
