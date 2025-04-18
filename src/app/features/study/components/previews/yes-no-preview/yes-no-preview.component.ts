import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Section } from '../../../models/section.model';
import { YesNoData } from '../../../models/yes-no.model';

@Component({
  selector: 'app-yes-no-preview',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './yes-no-preview.component.html',
  styleUrl: './yes-no-preview.component.css'
})
export class YesNoPreviewComponent {
  @Input() section: Section | null = null;
  @Output() responseChange = new EventEmitter<'yes' | 'no'>();

  selectedOption: 'yes' | 'no' | null = null;

  // Variable local para la vista previa (podés darle la estructura que necesites)
  previewData: YesNoData = {
    title: '',
    subtitle: '',
  };

  // Cada vez que el input cambia (por ejemplo, al cambiar de clip o actualizar datos),
  // actualizamos la variable local con los datos de block.data.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.previewData = this.section.data || {
        title: 'No se ha ingresado la pregunta',
        subtitle: ''
      };

      // Restaurar respuesta guardada si existe
      if (this.section.response) {
        this.selectedOption = this.section.response;
      }
    }
  }

  selectOption(option: 'yes' | 'no') {
    this.selectedOption = option;
    this.responseChange.emit(option);
  }
}
