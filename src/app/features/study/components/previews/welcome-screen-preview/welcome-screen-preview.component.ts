import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Section } from '../../../models/section.model';
import { WelcomeScreenData } from '../../../models/welcome-screen.model';

@Component({
  selector: 'app-welcome-screen-preview',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './welcome-screen-preview.component.html',
  styleUrl: './welcome-screen-preview.component.css'
})
export class WelcomeScreenPreviewComponent {
  // Recibimos el objeto de la sección (con sus datos guardados)
  @Input() section!: Section;

  // Variable local para la vista previa (podés darle la estructura que necesites)
  previewData: WelcomeScreenData = {
    title: '',
    subtitle: '',
  };

  // Cada vez que el input cambia (por ejemplo, al cambiar de clip o actualizar datos),
  // actualizamos la variable local con los datos de block.data.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      // Si hay un valor guardado en block.data.title, lo usamos; de lo contrario, un valor por defecto.
      this.previewData = this.section.data && this.section.data.title 
        ? { title: this.section.data.title, subtitle: this.section.data.subtitle }
        : { title: 'No se ha ingresado la pregunta', subtitle: '' };
    }
  }
}
