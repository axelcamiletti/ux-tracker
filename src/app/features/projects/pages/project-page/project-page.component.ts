import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntil, finalize } from 'rxjs';
import { Study } from '../../../study/models/study.model';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';
import { StudyService } from '../../../study/services/study.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../modals/confirm-dialog/confirm-dialog.component';
import { EditStudyNameModalComponent } from '../../../study/modals/edit-study-name-modal/edit-study-name-modal.component';
import { FirebaseDatePipe } from '../../../../pipes/firebase-date.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { Subject } from 'rxjs';

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
    FirebaseDatePipe,
    MatMenuModule
  ],
  templateUrl: './project-page.component.html',
  styleUrls: ['./project-page.component.css']
})
export class ProjectPageComponent implements OnInit, OnDestroy {
  // Private signal state
  private _project = signal<Project | null>(null);
  private _studies = signal<Study[]>([]);
  private _loading = signal(true);
  private _projectId = signal<string>('');
  private destroy$ = new Subject<void>();

  // Inject dependencies
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private studyService = inject(StudyService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Public readonly signals
  project = this._project.asReadonly();
  studies = this._studies.asReadonly();
  loading = this._loading.asReadonly();
  projectId = this._projectId.asReadonly();

  // Computed properties
  studyCount = computed(() => this._studies().length);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this._projectId.set(id);

    if (id) {
      this.loadProject();
    } else {
      this._loading.set(false);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProject() {
    this._loading.set(true);
    this.projectService.getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          const project = projects.find(p => p.id === this._projectId()) || null;
          this._project.set(project);

          if (project) {
            this.loadStudies();
          } else {
            this._loading.set(false);
          }
        },
        error: (error) => {
          console.error('Error loading project:', error);
          this.snackBar.open('Error al cargar el proyecto', 'Cerrar', { duration: 3000 });
          this._loading.set(false);
        }
      });
  }

  loadStudies() {
    this.studyService.getStudiesByProjectId(this._projectId())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this._loading.set(false))
      )
      .subscribe({
        next: (studies) => {
          // Ensure each study has initialized stats
          this._studies.set(studies.map(study => ({
            ...study,
            stats: study.stats || {
              totalResponses: 0,
              completedResponses: 0,
              averageCompletionTime: 0,
              lastResponseAt: null
            }
          })));
        },
        error: (error) => {
          console.error('Error loading studies:', error);
          this.snackBar.open('Error al cargar los estudios', 'Cerrar', { duration: 3000 });
        }
      });
  }

  navigateToStudy(study: Study) {
    if (study.status === 'draft') {
      this.router.navigate(['/study', study.id, 'creation']);
    } else if (study.status === 'published' || study.status === 'completed') {
      this.router.navigate(['/study', study.id, 'results']);
    }
  }

  createNewStudy() {
    if (!this._projectId()) return;

    const newStudy: Omit<Study, 'id'> = {
      name: 'Nuevo estudio',
      projectId: this._projectId(),
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
          this._studies.update(studies => studies.filter(s => s.id !== study.id));
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
          this._studies.update(studies => studies.map(s => s.id === study.id ? updatedStudy : s));
        } catch (error) {
          console.error('Error updating study name:', error);
          this.snackBar.open('Error al actualizar el nombre del estudio', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }
}
