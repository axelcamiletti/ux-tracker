import { Component, Input, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PrototypeTestSection, FigmaUrl } from '../../../models/section.model';
import { StudyStateService } from '../../../services/study-state.service';
import { FigmaService } from '../../../services/figma.service';
import { StudyPrototypeService } from '../../../services/study-prototype.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-prototype-test-form',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatRadioModule,
    FormsModule,
    MatMenuModule,
    MatProgressBarModule
  ],
  templateUrl: './prototype-test-form.component.html',
  styleUrl: './prototype-test-form.component.css'
})
export class PrototypeTestFormComponent implements OnInit, OnDestroy {
  @Input() section!: PrototypeTestSection;

  private destroy$ = new Subject<void>();
  private urlRegex = /^https:\/\/www\.figma\.com\/(proto|file)\/([a-zA-Z0-9]+)\/([^?]+)\?.*(?:node-id=([^&]+)).*(?:starting-point-node-id=([^&]+))?/;

  title = '';
  description = '';
  fileId = '';
  figmaUrl: FigmaUrl | null = null;
  figmaFileName = '';
  images: any = [];
  exportedImages: { name: string; imageUrl: string }[] = [];
  selectedImage: { name: string, imageUrl: string } | null = null;
  startScreenImage: { name: string, imageUrl: string } | null = null;
  isLoading = false;
  importEnabled = false;

  constructor(
    private figmaService: FigmaService,
    private studyState: StudyStateService,
    private snackBar: MatSnackBar,
    private studyPrototypeService: StudyPrototypeService
  ) {
    console.log('PrototypeTestFormComponent: Constructor called');
  }

  ngOnInit() {
    console.log('PrototypeTestFormComponent: ngOnInit');
    this.studyState.prototypeTestSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        console.log('PrototypeTestFormComponent: Received section update:', section);
        if (section && section.id === this.section?.id) {
          console.log('PrototypeTestFormComponent: Updating form data from section');
          this.updateFormDataFromSection(section);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('PrototypeTestFormComponent: ngOnChanges', changes);
    if (changes['section'] && !changes['section'].firstChange && this.section) {
      console.log('PrototypeTestFormComponent: Section changed, updating form data');
      this.updateFormDataFromSection(this.section);
    }
  }

  private updateFormDataFromSection(section: PrototypeTestSection) {
    console.log('PrototypeTestFormComponent: updateFormDataFromSection called with:', section);

    // Solo actualizar si los valores son diferentes
    if (this.title !== section.title) {
      this.title = section.title || '';
    }
    if (this.description !== section.description) {
      this.description = section.description || '';
    }
    if (this.fileId !== section.data.prototypeUrl) {
      this.fileId = section.data.prototypeUrl || '';
      if (this.fileId) {
        this.processUrl(this.fileId);
      }
    }
  }

  updateTitle(value: string) {
    this.title = value;
    this.section.title = value;
    this.studyState.setPrototypeTestSection(this.section);
  }

  updateSubtitle(value: string) {
    this.description = value;
    this.section.description = value;
    this.studyState.setPrototypeTestSection(this.section);
  }

  onUrlChange(url: string) {
    console.log('onUrlChange called with url:', url);
    this.fileId = url;
    this.processUrl(url);
  }

  processUrl(url: string) {
    console.log('processUrl called with url:', url);
    console.log('Current regex pattern:', this.urlRegex);

    try {
      const match = url.match(this.urlRegex);
      console.log('URL match result:', match);

      if (match) {
        console.log('URL matched successfully, extracting components...');
        this.figmaUrl = {
          fileType: match[1],
          fileKey: match[2],
          fileName: decodeURIComponent(match[3]),
          nodeId: match[4],
          startingNodeId: match[5]
        };
        console.log('Parsed figmaUrl object:', this.figmaUrl);

        this.figmaFileName = this.figmaUrl.fileName.replace(/-/g, ' ');
        this.importEnabled = true;

        // Update section data
        this.section.data = {
          ...this.section.data,
          prototypeUrl: url
        };

        console.log('Updating section with new URL data');
        this.studyState.setPrototypeTestSection(this.section);
      } else {
        console.log('URL did not match the expected pattern');
        this.figmaUrl = null;
        this.figmaFileName = '';
        this.importEnabled = false;
      }
    } catch (error) {
      console.error('Error in processUrl:', error);
      this.figmaUrl = null;
      this.figmaFileName = '';
      this.importEnabled = false;
    }
  }

  extractFramesAsImages() {
    console.log('extractFramesAsImages called');
    console.log('Current figmaUrl:', this.figmaUrl);

    if (!this.figmaUrl) {
      console.error('No valid Figma URL provided');
      return;
    }

    this.isLoading = true;
    console.log('Attempting to get file with key:', this.figmaUrl.fileKey);

    this.figmaService.getFile(this.figmaUrl.fileKey).subscribe({
      next: (fileResponse) => {
        console.log('File response received:', fileResponse);
        const pages = fileResponse.document.children;
        const allFrames: any[] = [];

        for (const page of pages) {
          const topLevelFrames = this.findTopLevelFrames(page);
          allFrames.push(...topLevelFrames);
        }

        console.log('Found frames:', allFrames);
        const frameIds = allFrames.map(frame => frame.id);
        console.log('Frame IDs to export:', frameIds);

        if (!this.figmaUrl) return;

        console.log('Requesting images for frames...');
        this.figmaService.getImages(this.figmaUrl.fileKey, frameIds).subscribe({
          next: (imageResponse) => {
            console.log('Image response received:', imageResponse);
            this.exportedImages = allFrames.map(frame => ({
              name: frame.name,
              imageUrl: imageResponse.images[frame.id]
            }));

            // Save frames to StudyPrototypeService
            this.studyPrototypeService.saveResponse({
              sectionId: this.section.id,
              timestamp: new Date(),
              type: 'prototype-test',
              response: {
                completed: true,
                timeSpent: 0,
                interactions: this.exportedImages.map(frame => ({
                  elementId: frame.name,
                  action: 'frame-loaded',
                  timestamp: new Date(),
                  position: { x: 0, y: 0 }
                }))
              }
            });
            console.log(this.exportedImages);


            // Encontrar y establecer el start screen basado en el nodeId
            if (this.figmaUrl?.nodeId) {
              const startFrame = allFrames.find(frame => frame.id.replace(':', '%3A') === this.figmaUrl?.nodeId);
              if (startFrame) {
                this.startScreenImage = {
                  name: startFrame.name,
                  imageUrl: imageResponse.images[startFrame.id]
                };
              }
            }

            // Update section with prototype URL, frames and starting node
            this.section.data = {
              ...this.section.data,
              prototypeUrl: this.fileId,
              startingNodeId: this.figmaUrl?.nodeId,
              frames: allFrames.map(frame => ({
                id: frame.id,
                name: frame.name,
                imageUrl: imageResponse.images[frame.id]
              })),
              showPreview: true
            };

            console.log('Updating section with frame data');
            this.studyState.setPrototypeTestSection(this.section);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error getting images:', error);
            this.handleFigmaError(error);
          }
        });
      },
      error: (error) => {
        console.error('Error getting file:', error);
        this.handleFigmaError(error);
      }
    });
  }

  private handleFigmaError(error: any) {
    console.error('Error in Figma API:', error);
    this.isLoading = false;
    this.snackBar.open('Error accessing Figma API', 'Dismiss', { duration: 3000 });
  }

  selectImage(image: { name: string, imageUrl: string }) {
    this.selectedImage = image;

    // Buscar el ID del frame seleccionado
    const selectedFrame = this.section.data.frames?.find(f => f.imageUrl === image.imageUrl);
    if (selectedFrame) {
      this.section.data = {
        ...this.section.data,
        selectedTargetNodeId: selectedFrame.id
      };
      this.studyState.setPrototypeTestSection(this.section);
    }
  }

  private findTopLevelFrames(node: any): any[] {
    let frames: any[] = [];

    if (node.type === 'DOCUMENT' || node.type === 'CANVAS') {
      for (const child of node.children || []) {
        if (child.type === 'FRAME') {
          frames.push(child);
        }
      }
    }

    return frames;
  }
}
