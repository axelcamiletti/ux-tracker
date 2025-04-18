import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { FigmaService } from '../../../../../services/figma.service';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Section } from '../../../models/section.model';

@Component({
  selector: 'app-prototype-test-form',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatRadioModule, FormsModule, MatMenuModule, MatProgressBarModule],
  templateUrl: './prototype-test-form.component.html',
  styleUrl: './prototype-test-form.component.css'
})
export class PrototypeTestFormComponent {
  @Output() delete = new EventEmitter<void>();
  @Output() titleChange = new EventEmitter<string>();
  @Input() section!: Section;

  images: any = [];
  exportedImages: { name: string; imageUrl: string }[] = [];
  selectedImage: { name: string, imageUrl: string } | null = null;
  figmaUrl:string = '';
  fileId = '9kNE6ihrEc2oSxGDUFxExN';
  imagesLoaded = false;
  isLoading = false;

  constructor(
    private figmaService: FigmaService,
    /* private globalFormService: GlobalFormService */
  ) {}

  extractFramesAsImages() {
    if (!this.fileId) {
      console.error('No se ha ingresado un File ID de Figma.');
      return;
    }

    this.isLoading = true;
    this.imagesLoaded = false;

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

            console.log('Imágenes exportadas con nombres:', this.exportedImages);
            this.imagesLoaded = true;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error exportando imágenes:', error);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error obteniendo archivo:', error);
        this.isLoading = false;
      }
    });
  }

  selectImage(image: { name: string, imageUrl: string }) {
    this.selectedImage = image;
  }

  // Función auxiliar para encontrar frames recursivamente
  private findTopLevelFrames(node: any): any[] {
    let topLevelFrames: any[] = [];

    if (node.type === 'DOCUMENT' || node.type === 'CANVAS') {
      for (const child of node.children || []) {
        if (child.type === 'FRAME') {
          topLevelFrames.push(child);
        }
      }
    }

    return topLevelFrames;
  }

  title = '';
  subtitle = '';
  yesLabel = 'Sí';
  noLabel = 'No';

  updateTitle(value: string) {
    this.title = value;
    this.titleChange.emit(value);
    this.updateFormData();
  }

  updateSubtitle(value: string) {
    this.subtitle = value;
    this.updateFormData();
  }

  private updateFormData() {
    /* this.globalFormService.setYesNoData({
      title: this.title,
      subtitle: this.subtitle,
    }); */
  }

  onDelete() {
    this.delete.emit();
  }
}
