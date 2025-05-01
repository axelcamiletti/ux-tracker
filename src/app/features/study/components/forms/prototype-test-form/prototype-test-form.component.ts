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
import { Subject, takeUntil } from 'rxjs';
import { StudyPrototypeService } from '../../../services/study-prototype.service';

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

  formData = {
    title: '',
    description: '',
    fileId: '',
    figmaUrl: null as FigmaUrl | null,
    figmaFileName: '',
    exportedImages: [] as { name: string; imageUrl: string }[],
    selectedImage: null as { name: string, imageUrl: string } | null,
    startScreenImage: null as { name: string, imageUrl: string } | null,
    isLoading: false,
    importEnabled: false
  };

  constructor(
    private studyPrototypeService: StudyPrototypeService,
    private studyState: StudyStateService,
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.studyState.prototypeTestSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        if (section && section.id === this.section?.id) {
          this.updateFormDataFromSection(section);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.updateFormDataFromSection(this.section);
    }
  }

  private updateFormDataFromSection(section: PrototypeTestSection) {
    // Update formData properties only if they are different
    if (this.formData.title !== section.title) {
      this.formData.title = section.title || '';
    }
    if (this.formData.description !== section.description) {
      this.formData.description = section.description || '';
    }
    if (this.formData.fileId !== section.data.prototypeUrl) {
      this.formData.fileId = section.data.prototypeUrl || '';
      if (this.formData.fileId) {
        this.processUrl(this.formData.fileId);

        // If there is a prototype URL and saved frames
        if (section.data.frames && section.data.frames.length > 0) {
          // Load saved frames into exportedImages
          this.formData.exportedImages = section.data.frames.map(frame => ({
            name: frame.name,
            imageUrl: frame.imageUrl
          }));

          // Restore the start screen
          if (section.data.startingNodeId) {
            const startFrame = section.data.frames.find(
              frame => frame.id.replace(':', '%3A') === section.data.startingNodeId
            );
            if (startFrame) {
              this.formData.startScreenImage = {
                name: startFrame.name,
                imageUrl: startFrame.imageUrl
              };
            }
          }

          // Restore the selected target screen
          if (section.data.selectedTargetNodeId) {
            const targetFrame = section.data.frames.find(
              frame => frame.id === section.data.selectedTargetNodeId
            );
            if (targetFrame) {
              this.formData.selectedImage = {
                name: targetFrame.name,
                imageUrl: targetFrame.imageUrl
              };
            }
          }
        } else if (this.formData.figmaUrl) {
          // If there is a URL but no frames, load them automatically
          this.extractFramesAsImages();
        }
      }
    }
  }

  updateTitle(value: string) {
    this.formData.title = value;
    this.section.title = value;
    this.studyState.setPrototypeTestSection(this.section);
  }

  updateSubtitle(value: string) {
    this.formData.description = value;
    this.section.description = value;
    this.studyState.setPrototypeTestSection(this.section);
  }

  onUrlChange(url: string) {
    this.formData.fileId = url;
    this.processUrl(url);
  }

  processUrl(url: string) {
    try {
      const match = url.match(this.urlRegex);

      if (match) {
        this.formData.figmaUrl = {
          fileType: match[1],
          fileKey: match[2],
          fileName: decodeURIComponent(match[3]),
          nodeId: match[4],
          startingNodeId: match[5]
        };

        this.formData.figmaFileName = this.formData.figmaUrl.fileName.replace(/-/g, ' ');
        this.formData.importEnabled = true;
      } else {
        this.formData.figmaUrl = null;
        this.formData.figmaFileName = '';
        this.formData.importEnabled = false;
      }
    } catch (error) {
      this.formData.figmaUrl = null;
      this.formData.figmaFileName = '';
      this.formData.importEnabled = false;
    }
  }

  importPrototype() {
    if (!this.formData.figmaUrl) {
      return;
    }

    // Update section data with prototype URL
    this.section.data = {
      ...this.section.data,
      prototypeUrl: this.formData.fileId
    };

    // Save the change before extracting frames
    this.studyState.setPrototypeTestSection(this.section);

    // Proceed with frame extraction
    this.extractFramesAsImages();
  }

  extractFramesAsImages() {
    if (!this.formData.figmaUrl) {
      return;
    }

    this.formData.isLoading = true;

    this.studyState.setPrototypeTestSection(this.section);

    this.studyPrototypeService.getFile(this.formData.figmaUrl.fileKey).subscribe({
      next: (fileResponse) => {
        const pages = fileResponse.document.children;
        const allFrames: any[] = [];

        for (const page of pages) {
          const topLevelFrames = this.findTopLevelFrames(page);
          allFrames.push(...topLevelFrames);
        }

        const frameIds = allFrames.map(frame => frame.id);

        if (!this.formData.figmaUrl) return;

        this.studyPrototypeService.getImages(this.formData.figmaUrl.fileKey, frameIds).subscribe({
          next: (imageResponse) => {
            this.formData.exportedImages = allFrames.map(frame => ({
              name: frame.name,
              imageUrl: imageResponse.images[frame.id]
            }));

            // Find and set the start screen based on nodeId
            if (this.formData.figmaUrl?.nodeId) {
              const startFrame = allFrames.find(frame => frame.id.replace(':', '%3A') === this.formData.figmaUrl?.nodeId);
              if (startFrame) {
                this.formData.startScreenImage = {
                  name: startFrame.name,
                  imageUrl: imageResponse.images[startFrame.id]
                };
              }
            }

            // Update section with frames and starting node
            this.section.data = {
              ...this.section.data,
              startingNodeId: this.formData.figmaUrl?.nodeId,
              frames: allFrames.map(frame => ({
                id: frame.id,
                name: frame.name,
                imageUrl: imageResponse.images[frame.id]
              })),
            };

            this.studyState.setPrototypeTestSection(this.section);
            this.formData.isLoading = false;
          },
          error: (error) => {
            this.handleFigmaError(error);
          }
        });
      },
      error: (error) => {
        this.handleFigmaError(error);
      }
    });
  }

  private handleFigmaError(error: any) {
    this.formData.isLoading = false;
    this.snackBar.open('Error accessing Figma API', 'Dismiss', { duration: 3000 });
  }

  selectImage(image: { name: string, imageUrl: string }) {
    this.formData.selectedImage = image;

    // Find the ID of the selected frame
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
