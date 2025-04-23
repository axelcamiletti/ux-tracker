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
import { PrototypeTestSection } from '../../../models/section.model';
import { StudyStateService } from '../../../services/study-state.service';
import { FigmaService } from '../../../../../services/figma.service';
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

  title = '';
  description = '';
  fileId = '';
  images: any = [];
  exportedImages: { name: string; imageUrl: string }[] = [];
  selectedImage: { name: string, imageUrl: string } | null = null;
  isLoading = false;

  constructor(
    private figmaService: FigmaService,
    private studyState: StudyStateService
  ) {}

  ngOnInit() {
    this.studyState.prototypeTestSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        if (section) {
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
      this.studyState.setPrototypeTestSection(this.section);
    }
  }

  private updateFormDataFromSection(section: PrototypeTestSection) {
    this.title = section.title || '';
    this.description = section.description || '';
    this.fileId = section.data.prototypeUrl || '';

    /* if (section.data.selectedImage) {
      this.selectedImage = section.data.selectedImage;
    } */
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

  extractFramesAsImages() {
    if (!this.fileId) {
      console.error('No Figma File ID provided');
      return;
    }

    this.isLoading = true;

    this.figmaService.getFile(this.fileId).subscribe({
      next: (fileResponse) => {
        const pages = fileResponse.document.children;
        const allFrames: any[] = [];

        for (const page of pages) {
          const topLevelFrames = this.findTopLevelFrames(page);
          allFrames.push(...topLevelFrames);
        }

        const frameIds = allFrames.map(frame => frame.id);

        this.figmaService.getImages(this.fileId, frameIds).subscribe({
          next: (imageResponse) => {
            this.exportedImages = allFrames.map(frame => ({
              name: frame.name,
              imageUrl: imageResponse.images[frame.id]
            }));

            // Update section with prototype URL
            this.section.data = {
              ...this.section.data,
              prototypeUrl: this.fileId
            };

            this.studyState.setPrototypeTestSection(this.section);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error exporting images:', error);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error getting file:', error);
        this.isLoading = false;
      }
    });
  }

  selectImage(image: { name: string, imageUrl: string }) {
    this.selectedImage = image;
    this.section.data = {
      ...this.section.data,
      /* selectedImage: image */
    };
    this.studyState.setPrototypeTestSection(this.section);
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
