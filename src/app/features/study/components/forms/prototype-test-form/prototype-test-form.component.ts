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
import { StudyService } from '../../../services/study.service';
import { Subject, takeUntil } from 'rxjs';
import { StudyPrototypeService } from '../../../services/study-prototype.service';
import { Study } from '../../../models/study.model';
import { IconSectionComponent } from "../../icon-section/icon-section.component";

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
    MatProgressBarModule,
    IconSectionComponent
],
  templateUrl: './prototype-test-form.component.html',
  styleUrl: './prototype-test-form.component.css'
})
export class PrototypeTestFormComponent implements OnInit, OnDestroy {
  @Input() section!: PrototypeTestSection;

  private destroy$ = new Subject<void>();

  formData = {
    title: '',
    description: '',
    originalUrl: '',
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
    private studyService: StudyService,
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
    if (this.formData.originalUrl !== section.data.originalUrl) {
      this.formData.originalUrl = section.data.originalUrl || '';
      if (this.formData.originalUrl) {
        this.processUrl(this.formData.originalUrl);

        // If there is a prototype URL and saved nodes
        if (section.data.nodes && section.data.nodes.length > 0) {
          // Load saved nodes into exportedImages
          this.formData.exportedImages = section.data.nodes.map(node => ({
            name: node.name,
            imageUrl: node.imageUrl
          }));

          // Restore the start screen
          if (section.data.startingNodeId) {
            const startNode = section.data.nodes.find(
              node => node.id.replace(':', '%3A') === section.data.startingNodeId
            );
            if (startNode) {
              this.formData.startScreenImage = {
                name: startNode.name,
                imageUrl: startNode.imageUrl
              };
            }
          }

          // Restore the selected target screen
          if (section.data.selectedTargetNodeId) {
            const targetNode = section.data.nodes.find(
              node => node.id === section.data.selectedTargetNodeId
            );
            if (targetNode) {
              this.formData.selectedImage = {
                name: targetNode.name,
                imageUrl: targetNode.imageUrl
              };
            }
          }
        } else if (this.formData.figmaUrl) {
          // If there is a URL but no nodes, load them automatically
          this.extractNodesAsImages();
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
    this.formData.originalUrl = url;
    this.processUrl(url);
  }

  processUrl(url: string) {
    const result = this.studyPrototypeService.processUrl(url);

    // Actualizar el estado local con el resultado
    this.formData.figmaUrl = result.figmaUrl;
    this.formData.figmaFileName = result.figmaFileName;
    this.formData.importEnabled = result.importEnabled;

    // Si la URL es válida, actualizar los datos de la sección
    if (result.figmaUrl && result.embedUrl) {
      // Update section data with the original URL and embed URL
      this.section.data = {
        ...this.section.data,
        originalUrl: url,
        embedUrl: result.embedUrl
      };

      // Save the updated section to the study state
      this.studyState.setPrototypeTestSection(this.section);
    }
  }

  importPrototype() {
    if (!this.formData.figmaUrl) {
      return;
    }

    // Update section data with prototype URL
    this.section.data = {
      ...this.section.data,
      embedUrl: this.formData.originalUrl,
      originalUrl: this.formData.originalUrl
    };

    // Guardar la sección actualizada en el estado del estudio
    this.studyState.setPrototypeTestSection(this.section);

    // Proceed with nodes extraction
    this.extractNodesAsImages();
  }

  extractNodesAsImages() {
    if (!this.formData.figmaUrl) {
      return;
    }

    this.formData.isLoading = true;

    // Usar el método del servicio para extraer los nodes
    this.studyPrototypeService.extractNodesAsImages(this.formData.figmaUrl).subscribe({
      next: (result) => {
        // Actualizar la UI con los nodes extraídos
        this.formData.exportedImages = result.nodes.map(node => ({
          name: node.name,
          imageUrl: node.imageUrl
        }));

        // Establecer la pantalla inicial basada en startingNodeId
        if (this.formData.figmaUrl?.nodeId) {
          const startNode = result.nodes.find(node =>
            node.id.replace(':', '%3A') === this.formData.figmaUrl?.nodeId
          );

          if (startNode) {
            this.formData.startScreenImage = {
              name: startNode.name,
              imageUrl: startNode.imageUrl
            };
          }
        }

        // Actualizar la sección con los nodes y el nodo inicial
        this.section.data = {
          ...this.section.data,
          startingNodeId: this.formData.figmaUrl?.nodeId,
          nodes: result.nodes
        };

        // Guardar la sección en el estado del estudio
        this.studyState.setPrototypeTestSection(this.section);

        this.formData.isLoading = false;
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

    // Find the ID of the selected nodes
    const selectedNode = this.section.data.nodes?.find(n => n.imageUrl === image.imageUrl);
    if (selectedNode) {
      this.section.data = {
        ...this.section.data,
        selectedTargetNodeId: selectedNode.id
      };
      this.studyState.setPrototypeTestSection(this.section);
    }
  }

}
