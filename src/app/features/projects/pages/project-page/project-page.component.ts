import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { Study } from '../../../study/models/study.model';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';
import { StudyService } from '../../../study/services/study.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../modals/confirm-dialog/confirm-dialog.component';
import { EditStudyNameModalComponent } from '../../../study/modals/edit-study-name-modal/edit-study-name-modal.component';
import { FirebaseDatePipe } from '../../../../pipes/firebase-date.pipe';

@Component({
  selector: 'app-project-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FirebaseDatePipe
  ],
  templateUrl: './project-page.component.html',
  styleUrls: ['./project-page.component.css']
})
export class ProjectPageComponent implements OnInit, OnDestroy {
  project: Project | null = null;
  studies: Study[] = [];
  loading = true;
  private destroy$ = new Subject<void>();
  projectId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private studyService: StudyService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    if (this.projectId) {
      this.loadProject();
      this.loadStudies();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProject() {
    this.loading = true;
    this.projectService.getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          this.project = projects.find(p => p.id === this.projectId) || null;
          if (this.project) {
            this.loadStudies();
          } else {
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error loading project:', error);
          this.snackBar.open('Error al cargar el proyecto', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  loadStudies() {
    this.loading = true;
    this.studyService.getStudiesByProjectId(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (studies) => {
          this.studies = studies;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading studies:', error);
          this.snackBar.open('Error al cargar los estudios', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  createNewStudy() {
    if (!this.projectId) return;

    const newStudy: Omit<Study, 'id'> = {
      name: 'Nuevo estudio',
      projectId: this.projectId,
      description: '',
      status: 'draft',
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        allowMultipleResponses: false,
        requireEmail: false,
        showProgressBar: true,
        collectDeviceInfo: true
      },
      stats: {
        totalResponses: 0,
        completedResponses: 0,
        averageCompletionTime: 0,
        lastResponseAt: new Date()
      },
      participantIds: [],
      responseIds: [],
      createdBy: '',
      lastModifiedBy: ''
    };

    this.studyService.createStudy(newStudy).then(studyId => {
      this.snackBar.open('Estudio creado correctamente', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/study', studyId, 'creation']);
    }).catch(error => {
      console.error('Error creating study:', error);
      this.snackBar.open('Error al crear el estudio', 'Cerrar', { duration: 3000 });
    });
  }

  async confirmDelete(study: Study) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar estudio',
        message: `¿Estás seguro de que deseas eliminar el estudio "${study.name}"? Esta acción no se puede deshacer.`
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          await this.studyService.deleteStudy(study.id);
          this.snackBar.open('Estudio eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.studies = this.studies.filter(s => s.id !== study.id);
        } catch (error) {
          console.error('Error deleting study:', error);
          this.snackBar.open('Error al eliminar el estudio', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  editStudyName(study: Study) {
    const dialogRef = this.dialog.open(EditStudyNameModalComponent, {
      data: { studyName: study.name }
    });

    dialogRef.afterClosed().subscribe(async (newName: string) => {
      if (newName && newName !== study.name) {
        try {
          await this.studyService.updateStudy(study.id, { name: newName });
          this.snackBar.open('Nombre del estudio actualizado correctamente', 'Cerrar', { duration: 3000 });
          const updatedStudy = { ...study, name: newName };
          this.studies = this.studies.map(s => s.id === study.id ? updatedStudy : s);
        } catch (error) {
          console.error('Error updating study name:', error);
          this.snackBar.open('Error al actualizar el nombre del estudio', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }
}
