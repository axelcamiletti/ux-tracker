import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { NewProjectModalComponent } from '../../modals/new-project-modal/new-project-modal.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  creatingProject = false;
  deletingProject = false;

  constructor(
    private dialog: MatDialog,
    private projectService: ProjectService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  private loadProjects() {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.loading = false;
        this.snackBar.open('Error al cargar los proyectos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  openNewProjectModal() {
    const dialogRef = this.dialog.open(NewProjectModalComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createNewProject(result);
      }
    });
  }

  private createNewProject(name: string) {
    this.creatingProject = true;
    const newProject: Omit<Project, 'id'> = {
      name: name,
      studies: [],
      createdAt: new Date()
    };

    this.projectService.createProject(newProject)
      .then(id => {
        console.log('Project created with ID:', id);
        this.loadProjects();
        this.snackBar.open('Proyecto creado exitosamente', 'Cerrar', { duration: 3000 });
      })
      .catch(error => {
        console.error('Error creating project:', error);
        this.snackBar.open('Error al crear el proyecto', 'Cerrar', { duration: 3000 });
      })
      .finally(() => {
        this.creatingProject = false;
      });
  }

  deleteProject(projectId: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    
    if (confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      this.deletingProject = true;
      this.projectService.deleteProject(projectId)
        .then(() => {
          this.projects = this.projects.filter(p => p.id !== projectId);
          this.snackBar.open('Proyecto eliminado exitosamente', 'Cerrar', { duration: 3000 });
        })
        .catch(error => {
          console.error('Error deleting project:', error);
          this.snackBar.open('Error al eliminar el proyecto', 'Cerrar', { duration: 3000 });
        })
        .finally(() => {
          this.deletingProject = false;
        });
    }
  }
}
