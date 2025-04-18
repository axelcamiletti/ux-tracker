import { Component, Input, OnInit } from '@angular/core';
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
    this.router.navigate(['/projects']);
  }

  async publishStudy() {
    if (!this.studyId) return;

    try {
      
      // Luego publicamos el estudio
      await this.studyService.publishStudy(this.studyId);
      
      this.snackBar.open('¡Estudio publicado con éxito!', 'Cerrar', { duration: 3000 });
      
      // Redirigir a la página de estadísticas
      this.router.navigate(['/study', this.studyId, 'analytics']);
    } catch (error) {
      console.error('Error publishing study:', error);
      this.snackBar.open('Error al publicar el estudio', 'Cerrar', { duration: 3000 });
    }
  }
}
