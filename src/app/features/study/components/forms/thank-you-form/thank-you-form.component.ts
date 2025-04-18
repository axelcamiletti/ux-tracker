import { Component, Input, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Section } from '../../../models/section.model';

@Component({
  selector: 'app-thank-you-form',
  imports: [MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatMenuModule, MatTooltipModule, FormsModule],
  templateUrl: './thank-you-form.component.html',
  styleUrl: './thank-you-form.component.css'
})
export class ThankYouFormComponent {
  @Input() section!: Section;

  formData: { title: string, subtitle: string } = { title: '', subtitle: '' };

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
