import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Project } from '../../models/project.model';

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
  editProjectForm: FormGroup;
  selectedImage: File | null = null;
  imagePreviewUrl: string | null = null;
  private dialogRef = inject(MatDialogRef<EditProjectModalComponent>);
  private data: { project: Project } = inject(MAT_DIALOG_DATA);

  constructor(private fb: FormBuilder) {
    this.editProjectForm = this.fb.group({
      name: [this.data.project.name, [Validators.required, Validators.minLength(3)]]
    });
    this.imagePreviewUrl = this.data.project.imageUrl || null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        this.selectedImage = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onSubmit() {
    if (this.editProjectForm.valid) {
      this.dialogRef.close({
        name: this.editProjectForm.get('name')?.value,
        image: this.selectedImage
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreviewUrl = null;
  }
}