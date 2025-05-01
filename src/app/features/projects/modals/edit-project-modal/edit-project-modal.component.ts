import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Project } from '../../models/project.model';
import { signal, computed } from '@angular/core';

interface DialogData {
  project: Project;
}

@Component({
  selector: 'app-edit-project-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './edit-project-modal.component.html',
  styles: [`
    .image-container {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      overflow: hidden;
      margin-right: 16px;
      background-color: #f3f4f6;
    }

    .img-contain {
      object-fit: contain;
    }

    .image-upload-section {
      margin-top: 1rem;
    }

    .upload-area {
      min-height: 150px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .preview-area {
      border-radius: 8px;
      overflow: hidden;
    }

    .overlay {
      transition: opacity 0.2s ease-in-out;
    }
  `]
})
export class EditProjectModalComponent {
  // Inject dependencies
  private dialogRef = inject(MatDialogRef<EditProjectModalComponent>);
  private data = inject<DialogData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  // Signal-based state
  selectedImage = signal<File | null | undefined>(undefined);
  imagePreviewUrl = signal<string | null | undefined>(this.data.project.imageUrl);
  submitting = signal<boolean>(false);

  // Computed properties
  hasSelectedImage = computed(() => this.selectedImage() !== undefined && this.selectedImage() !== null);
  showRemoveButton = computed(() => this.imagePreviewUrl() !== null && this.imagePreviewUrl() !== undefined);
  
  // Form
  editProjectForm = this.fb.group({
    name: [this.data.project.name, [Validators.required, Validators.minLength(3)]]
  });

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (this.validateImage(file)) {
        this.selectedImage.set(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewUrl.set(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // Reset file input
        input.value = '';
        alert('Formato de imagen no válido o tamaño excesivo (máximo 5MB)');
      }
    }
  }

  onSubmit() {
    if (this.editProjectForm.valid) {
      this.submitting.set(true);
      this.dialogRef.close({
        name: this.editProjectForm.get('name')?.value,
        image: this.selectedImage()
      });
    } else {
      // Resaltar errores en el formulario
      this.editProjectForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  removeImage() {
    this.selectedImage.set(null);
    this.imagePreviewUrl.set(null);
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
