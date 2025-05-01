import { Component, Input, SimpleChanges, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PrototypeTestSection, FigmaUrl } from '../../../models/section.model';
import { StudyStateService } from '../../../services/study-state.service';
import { StudyPrototypeService } from '../../../services/study-prototype.service';

@Component({
  selector: 'app-prototype-test-preview',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './prototype-test-preview.component.html',
  styleUrl: './prototype-test-preview.component.css'
})
export class PrototypeTestPreviewComponent implements OnInit {
  @Input() section!: PrototypeTestSection;
  @Input() responseId!: string;
  @ViewChild('iframePrototype') iframePrototype!: ElementRef<HTMLIFrameElement>;

  private urlRegex = /^https:\/\/www\.figma\.com\/(proto|file)\/([a-zA-Z0-9]+)\/([^?]+)\?.*(?:node-id=([^&]+)).*(?:starting-point-node-id=([^&]+))?/;

  showIframe = true;
  showPreview = false;

  previewData = {
    title: '',
    description: '',
    prototypeUrl: '' as string | SafeResourceUrl,
    figmaUrl: null as FigmaUrl | null,
  };

  constructor(
    private studyState: StudyStateService,
    private studyPrototype: StudyPrototypeService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.setupFigmaEventListener();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.updatePreviewData(this.section);
    }
  }

  private updatePreviewData(section: PrototypeTestSection) {
    let figmaUrl: FigmaUrl | null = null;
    let embedUrl = '';

    if (section.data && section.data.prototypeUrl) {
      const match = section.data.prototypeUrl.match(this.urlRegex);
      if (match) {
        figmaUrl = {
          fileType: match[1],
          fileKey: match[2],
          fileName: decodeURIComponent(match[3]),
          nodeId: match[4],
          startingNodeId: match[5] || match[4]
        };

        embedUrl = `https://embed.figma.com/${figmaUrl.fileType}/${figmaUrl.fileKey}/${figmaUrl.fileName}?node-id=${figmaUrl.startingNodeId}&embed-host=share&footer=false&viewport-controls=false&allow-external-events=true&client-id=fV57d1E9E5FCZ1d1hKVS3e`;

        // Mostrar el iframe cuando hay una URL válida
        this.showPreview = true;
      }
    } else {
      this.showPreview = false;
    }

    this.previewData = {
      title: section.title || '',
      description: section.description || '',
      prototypeUrl: embedUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl) : '',
      figmaUrl: figmaUrl,
    };
  }

  private setupFigmaEventListener(): void {
    if (this.iframePrototype?.nativeElement) {
      this.iframePrototype.nativeElement.contentWindow?.addEventListener('message', (event) => {
        if (event.origin.includes('figma.com')) {
          this.handleFigmaEvent(event.data);
        }
      });
    }
  }

  private async handleFigmaEvent(event: any): Promise<void> {
    if (this.section && this.responseId) {
      await this.studyPrototype.getFigmaEvent(event, this.responseId, this.section.id);
    }
  }

  onTestComplete(timeSpent: number, interactions?: Array<any>) {
    // Obtener la respuesta completa desde el servicio, que incluye todos los eventos capturados
    /* const completeResponse = this.studyPrototype.createSummaryResponse(this.section.id); */

    // También emitir la respuesta para mantener la compatibilidad con el flujo existente
    /* this.responseChange.emit(completeResponse); */

  }
}
