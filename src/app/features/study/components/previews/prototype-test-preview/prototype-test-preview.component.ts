import { Component, Input, Output, EventEmitter, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PrototypeTestSection, FigmaUrl } from '../../../models/section.model';
import { PrototypeTestResponse } from '../../../models/study-response.model';
import { StudyStateService } from '../../../services/study-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-prototype-test-preview',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './prototype-test-preview.component.html',
  styleUrl: './prototype-test-preview.component.css'
})
export class PrototypeTestPreviewComponent implements OnInit, OnDestroy {
  @Input() section!: PrototypeTestSection;
  @Output() responseChange = new EventEmitter<PrototypeTestResponse>();

  private destroy$ = new Subject<void>();
  private urlRegex = /^https:\/\/www\.figma\.com\/(proto|file)\/([a-zA-Z0-9]+)\/([^?]+)\?.*(?:node-id=([^&]+)).*(?:starting-point-node-id=([^&]+))?/;

  isIframeLoading = true;
  showIframe = false;
  showPreview = false;

  previewData = {
    title: '',
    description: '',
    prototypeUrl: '' as string | SafeResourceUrl,
    figmaUrl: null as FigmaUrl | null,
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

  constructor(
    private studyState: StudyStateService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.studyState.prototypeTestSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        if (section) {
          this.updatePreviewData(section);
          this.showPreview = section.data.showPreview ?? false;
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

  onIframeLoad() {
    console.log('Iframe loaded successfully');
    this.isIframeLoading = false;
  }

  loadPrototype() {
    this.showIframe = true;
    this.isIframeLoading = true;
  }

  private updatePreviewData(section: PrototypeTestSection) {
    this.isIframeLoading = true;
    this.showIframe = false;

    let figmaUrl: FigmaUrl | null = null;
    let embedUrl = '';

    if (section.data.prototypeUrl) {
      const match = section.data.prototypeUrl.match(this.urlRegex);
      if (match) {
        figmaUrl = {
          fileType: match[1],
          fileKey: match[2],
          fileName: decodeURIComponent(match[3]),
          nodeId: match[4],
          startingNodeId: match[5] || match[4]
        };

        embedUrl = `https://embed.figma.com/${figmaUrl.fileType}/${figmaUrl.fileKey}/${figmaUrl.fileName}?node-id=${figmaUrl.startingNodeId}&embed-host=share`;
      }
    }

    this.previewData = {
      title: section.title || '',
      description: section.description || '',
      prototypeUrl: embedUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl) : '',
      figmaUrl: figmaUrl,
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
          name: e.description
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
