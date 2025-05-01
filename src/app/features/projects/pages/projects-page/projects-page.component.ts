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
import { inject } from '@angular/core';
import { signal, computed } from '@angular/core';

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
  templateUrl: './projects-page.component.html',
  styleUrls: ['./projects-page.component.css']
})
export class ProjectsPageComponent implements OnInit {
  // Component-specific state
  creatingProject = signal(false);
  deletingProject = signal(false);
  editingProject = signal(false);

  // Inject dependencies
  private dialog = inject(MatDialog);
  private projectService = inject(ProjectService);
  private snackBar = inject(MatSnackBar);

  // Make service state available to template
  protected projects = this.projectService.projects;
  protected loading = this.projectService.loading;
  protected error = this.projectService.error;

  // Computed properties
  protected hasProjects = computed(() => this.projects().length > 0);
  protected isIdle = computed(() => !this.loading() && !this.creatingProject() &&
                                    !this.deletingProject() && !this.editingProject());

  ngOnInit() {
    this.projectService.loadProjects();
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
    this.creatingProject.set(true);
    let imageUrl = '';

    try {
      if (image) {
        // Validate image (type and size)
        if (!this.validateImage(image)) {
          throw new Error('Formato de imagen no válido o tamaño excesivo');
        }

        // Generate a unique filename for the image
        const fileName = `project-images/${Date.now()}-${image.name}`;
        // Upload the image and get the URL
        imageUrl = await this.projectService.uploadProjectImage(image, fileName);
      }

      const newProject: Omit<Project, 'id'> = {
        name: name,
        studies: [],
        createdAt: new Date(),
        imageUrl: imageUrl || undefined
      };

      const id = await this.projectService.createProject(newProject);
      this.snackBar.open('Proyecto creado exitosamente', 'Cerrar', { duration: 3000 });
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      const message = error instanceof Error ? error.message : 'Error al crear el proyecto';
      this.snackBar.open(message, 'Cerrar', { duration: 3000 });
    } finally {
      this.creatingProject.set(false);
    }
  }

  deleteProject(projectId: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    if (confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      this.deletingProject.set(true);
      this.projectService.deleteProject(projectId)
        .then(() => {
          this.snackBar.open('Proyecto eliminado exitosamente', 'Cerrar', { duration: 3000 });
        })
        .catch(error => {
          console.error('Error al eliminar proyecto:', error);
          this.snackBar.open('Error al eliminar el proyecto', 'Cerrar', { duration: 3000 });
        })
        .finally(() => {
          this.deletingProject.set(false);
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
        this.editingProject.set(true);
        try {
          const updates: Partial<Omit<Project, 'id'>> = {
            name: result.name
          };

          if (result.image) {
            // Validate image before uploading
            if (!this.validateImage(result.image)) {
              throw new Error('Formato de imagen no válido o tamaño excesivo');
            }

            // Upload new image if provided
            const fileName = `project-images/${Date.now()}-${result.image.name}`;
            updates.imageUrl = await this.projectService.uploadProjectImage(result.image, fileName);
          } else if (result.image === null) {
            // If image was explicitly removed, set imageUrl to null
            updates.imageUrl = null;
          }
          // If no image changes (result.image is undefined), don't include imageUrl in the update

          await this.projectService.updateProject(project.id, updates);
          this.snackBar.open('Proyecto actualizado exitosamente', 'Cerrar', { duration: 3000 });
        } catch (error) {
          console.error('Error al actualizar proyecto:', error);
          const message = error instanceof Error ? error.message : 'Error al actualizar el proyecto';
          this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        } finally {
          this.editingProject.set(false);
        }
      }
    });
  }

  // Helper to validate images
  private validateImage(file: File): boolean {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      return false;
    }

    // Check file size (limit to 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      return false;
    }

    return true;
  }
}
