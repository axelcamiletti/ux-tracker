import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { StudyService } from '../../services/study.service';
import { Study } from '../../models/study.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditStudyNameModalComponent } from '../../modals/edit-study-name-modal/edit-study-name-modal.component';
import { ShareStudyModalComponent } from '../../modals/share-study-modal/share-study-modal.component';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @Input() studyId: string = '';
  @Input() saving: boolean = false;
  @Input() lastSaved: Date | null = null;
  @Output() saveStudy = new EventEmitter<void>();
  study: Study | null = null;
  studyName: string = 'Cargando...';

  constructor(
    private router: Router,
    private studyService: StudyService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.studyId) {
      this.loadStudy();
    }
  }

  private loadStudy() {
    this.studyService.getStudyById(this.studyId).subscribe({
      next: (study: Study) => {
        this.study = study;
        this.studyName = study.name;
      },
      error: (error) => {
        console.error('Error loading study:', error);
        this.snackBar.open('Error al cargar el estudio', 'Cerrar', { duration: 3000 });
      }
    });
  }

  openEditNameModal() {
    const dialogRef = this.dialog.open(EditStudyNameModalComponent, {
      data: { studyName: this.studyName }
    });

    dialogRef.afterClosed().subscribe(async (newName: string) => {
      if (newName && newName !== this.studyName && this.studyId) {
        try {
          await this.studyService.updateStudy(this.studyId, { name: newName });
          this.studyName = newName;
          this.snackBar.open('Nombre del estudio actualizado correctamente', 'Cerrar', { duration: 3000 });
        } catch (error) {
          console.error('Error updating study name:', error);
          this.snackBar.open('Error al actualizar el nombre del estudio', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  navigateToProjects() {
    if (this.study && this.study.projectId) {
      // If we have a study with a project ID, navigate to that specific project
      this.router.navigate(['/projects', this.study.projectId]);
    } else {
      // Fallback to the projects list if no project ID is available
      this.router.navigate(['/projects']);
    }
  }

  async publishStudy() {
    if (!this.studyId) return;

    try {
      // Publicar el estudio y generar la URL pública
      await this.studyService.publishStudy(this.studyId);

      // Abrir el modal de compartir con la URL pública
      const publicUrl = `${window.location.origin}/study-public/${this.studyId}`;
      this.dialog.open(ShareStudyModalComponent, {
        data: { studyUrl: publicUrl },
        width: '500px'
      });

      this.snackBar.open('¡Estudio publicado con éxito!', 'Cerrar', { duration: 3000 });

      // Redirigir a la página de estadísticas
      this.router.navigate(['/study', this.studyId, 'analytics']);
    } catch (error) {
      console.error('Error publishing study:', error);
      this.snackBar.open('Error al publicar el estudio', 'Cerrar', { duration: 3000 });
    }
  }

  triggerSaveStudy() {
    this.saveStudy.emit();
  }
}
