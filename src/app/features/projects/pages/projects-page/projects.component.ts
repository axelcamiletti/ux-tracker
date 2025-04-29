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
import { EditProjectModalComponent } from '../../modals/edit-project-modal/edit-project-modal.component';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  creatingProject = false;
  deletingProject = false;
  editingProject = false;

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
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createNewProject(result.name, result.image);
      }
    });
  }

  private async createNewProject(name: string, image: File | null) {
    this.creatingProject = true;
    let imageUrl = '';

    try {
      if (image) {
        // Generate a unique filename for the image
        const fileName = `project-images/${Date.now()}-${image.name}`;
        // Upload the image and get the URL - you'll need to implement this in your project service
        imageUrl = await this.projectService.uploadProjectImage(image, fileName);
      }

      const newProject: Omit<Project, 'id'> = {
        name: name,
        studies: [],
        createdAt: new Date(),
        imageUrl: imageUrl || undefined
      };

      const id = await this.projectService.createProject(newProject);
      console.log('Project created with ID:', id);
      this.loadProjects();
      this.snackBar.open('Proyecto creado exitosamente', 'Cerrar', { duration: 3000 });
    } catch (error) {
      console.error('Error creating project:', error);
      this.snackBar.open('Error al crear el proyecto', 'Cerrar', { duration: 3000 });
    } finally {
      this.creatingProject = false;
    }
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

  openEditProjectModal(project: Project, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const dialogRef = this.dialog.open(EditProjectModalComponent, {
      width: '500px',
      disableClose: true,
      data: { project }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        this.editingProject = true;
        try {
          const updates: Partial<Omit<Project, 'id'>> = {
            name: result.name
          };

          if (result.image) {
            // Upload new image if provided
            const fileName = `project-images/${Date.now()}-${result.image.name}`;
            updates.imageUrl = await this.projectService.uploadProjectImage(result.image, fileName);
          } else if (result.image === null) {
            // If image was explicitly removed, set imageUrl to null (Firebase will accept null but not undefined)
            updates.imageUrl = null;
          }
          // If no image changes (result.image is undefined), don't include imageUrl in the update

          await this.projectService.updateProject(project.id, updates);
          this.loadProjects();
          this.snackBar.open('Project updated successfully', 'Close', { duration: 3000 });
        } catch (error) {
          console.error('Error updating project:', error);
          this.snackBar.open('Error updating project', 'Close', { duration: 3000 });
        } finally {
          this.editingProject = false;
        }
      }
    });
  }
}
