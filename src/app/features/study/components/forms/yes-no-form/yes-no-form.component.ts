import { Component, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Section } from '../../../models/section.model';
import { YesNoData } from '../../../models/yes-no.model';

@Component({
  selector: 'app-yes-no-form',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatMenuModule, MatTooltipModule, FormsModule],
  templateUrl: './yes-no-form.component.html',
  styleUrl: './yes-no-form.component.css'
})
export class YesNoFormComponent {
  @Input() section!: Section;

  formData: YesNoData = {
    title: '',
    subtitle: '',
  };

  // Cuando el input (block) cambia (por ejemplo, al cambiar de clip),
  // actualizamos el formData con lo guardado en block.data.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      // Si ya hay datos en el bloque, los usamos; de lo contrario, usamos un valor por defecto.
      this.formData = this.section.data && this.section.data.title
        ? { title: this.section.data.title, subtitle: this.section.data.subtitle }
        : { title: '', subtitle: '' };
    }
  }

  // Cada vez que el usuario modifique el texto, actualizamos nuestro formData
  // y propagamos el cambio al objeto block.data para que se guarde.
  onTitleChange(newTitle: string): void {
    this.formData.title = newTitle;
    // Actualiza el bloque; al hacerlo de forma inmutable (si así lo prefieres)
    // o bien modificándolo directamente (si block es un objeto mutable)
    this.section.data = { ...this.section.data, title: newTitle };
  }

  onSubtitleChange(newSubtitle: string): void {
    this.formData.subtitle = newSubtitle;
    this.section.data = { ...this.formData };
  }
}
