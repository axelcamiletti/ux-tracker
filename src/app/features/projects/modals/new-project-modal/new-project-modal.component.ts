import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { inject, signal } from '@angular/core';

@Component({
  selector: 'app-new-project-modal',
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
  templateUrl: './new-project-modal.component.html',
  styleUrls: ['./new-project-modal.component.css']
})
export class NewProjectModalComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<NewProjectModalComponent>);

  newProjectForm: FormGroup;
  selectedImage = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);

  constructor() {
    this.newProjectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        this.selectedImage.set(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewUrl.set(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onSubmit() {
    if (this.newProjectForm.valid) {
      this.dialogRef.close({
        name: this.newProjectForm.get('name')?.value,
        image: this.selectedImage()
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  removeImage() {
    this.selectedImage.set(null);
    this.imagePreviewUrl.set(null);
  }
}
