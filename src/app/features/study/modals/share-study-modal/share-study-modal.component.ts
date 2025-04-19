import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-share-study-modal',
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatSlideToggleModule, MatButtonModule],
  templateUrl: './share-study-modal.component.html',
  styleUrl: './share-study-modal.component.css'
})
export class ShareStudyModalComponent {
  studyUrl: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { studyUrl: string },
    private dialogRef: MatDialogRef<ShareStudyModalComponent>,
    private snackBar: MatSnackBar
  ) {
    this.studyUrl = data.studyUrl;
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.studyUrl).then(() => {
      this.snackBar.open('Enlace copiado al portapapeles', 'Cerrar', { duration: 2000 });
    });
  }

  close() {
    this.dialogRef.close();
  }
}
