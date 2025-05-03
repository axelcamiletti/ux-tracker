import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-edit-study-name-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="p-4">
      <h2 class="text-xl font-bold mb-4">Editar nombre del estudio</h2>
      <mat-form-field class="w-full">
        <mat-label>Nombre del estudio</mat-label>
        <input matInput [(ngModel)]="studyName" placeholder="Ingresa el nombre del estudio">
      </mat-form-field>
      <div class="flex justify-end gap-2 mt-4">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" (click)="onSave()">Guardar</button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 500px;
    }
  `]
})
export class EditStudyNameDialogComponent {
  studyName: string;

  constructor(
    public dialogRef: MatDialogRef<EditStudyNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { studyName: string }
  ) {
    this.studyName = data.studyName;
  }

  onSave() {
    this.dialogRef.close(this.studyName);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
