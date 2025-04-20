import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { StudyService } from '../../services/study.service';

@Component({
  selector: 'app-share-study-modal',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSlideToggleModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './share-study-modal.component.html',
  styleUrls: ['./share-study-modal.component.css']
})
export class ShareStudyModalComponent {
  studyUrl: string;
  allowMultipleResponses = new FormControl(false);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { studyUrl: string, studyId: string },
    private dialogRef: MatDialogRef<ShareStudyModalComponent>,
    private snackBar: MatSnackBar,
    private studyService: StudyService
  ) {
    this.studyUrl = data.studyUrl;
  }

  copyToClipboard(input: HTMLInputElement) {
    input.select();
    document.execCommand('copy');
    input.setSelectionRange(0, 0); // Deselect
    this.snackBar.open('Enlace copiado al portapapeles', 'Cerrar', { duration: 2000 });
  }

  async saveAndClose() {
    try {
      await this.studyService.updateStudy(this.data.studyId, {
        /* allowMultipleResponses: this.allowMultipleResponses.value ?? undefined */
      });
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Error updating study settings:', error);
      this.snackBar.open('Error al guardar la configuración', 'Cerrar', { duration: 3000 });
    }
  }

  close() {
    this.dialogRef.close();
  }
}
