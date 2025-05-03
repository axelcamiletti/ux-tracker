import { Component, Input, Output, EventEmitter, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { PrototypeTestSection } from '../../../models/section.model';
import { PrototypeTestResponse } from '../../../models/study-response.model';
import { StudyStateService } from '../../../services/study-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-prototype-test-preview',
  standalone: true,
  imports: [],
  templateUrl: './prototype-test-preview.component.html',
  styleUrl: './prototype-test-preview.component.css'
})
export class PrototypeTestPreviewComponent {
  @Input() section!: PrototypeTestSection;
  @Output() responseChange = new EventEmitter<PrototypeTestResponse>();

  response: string = '';
  private destroy$ = new Subject<void>();

  previewData = {
    title: '',
    description: '',
    required: false
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
      title: section.title || 'No se ha ingresado el título',
      description: section.description || '',
      required: section.required
    };
  }

  onResponseChange(value: string) {
    this.response = value;
    this.emitResponse();
  }

  private emitResponse() {
    const response: PrototypeTestResponse = {
      sectionId: this.section.id,
      timestamp: new Date(),
      type: 'prototype-test',
      response: {
        figmaEventLog: [],
      }
    };
    this.responseChange.emit(response);
  }
}
