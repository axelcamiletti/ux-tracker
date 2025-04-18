import { Component, Input, SimpleChanges } from '@angular/core';
import { MultipleChoiceData } from '../../../models/multiple-choice.model';
import { GlobalFormService } from '../../../services/global-form.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { Section } from '../../../models/section.model';

@Component({
  selector: 'app-multiple-choice-form',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatFormFieldModule, MatMenuModule, MatTooltipModule, FormsModule, MatIconModule, MatRadioModule, MatButtonModule],
  templateUrl: './multiple-choice-form.component.html',
  styleUrl: './multiple-choice-form.component.css'
})
export class MultipleChoiceFormComponent {
  @Input() section!: Section;

  formData: MultipleChoiceData = {
    title: '',
    subtitle: '',
    selectionType: 'single',
    options: []
  };

  optionCounter = 0;

  updateFormData: () => void = () => {};

  constructor(private globalFormService: GlobalFormService) {
    // Inicializar con una opción por defecto
    this.addOption();
  }

   // Cuando el input (block) cambia (por ejemplo, al cambiar de clip),
  // actualizamos el formData con lo guardado en block.data.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      // Si ya hay datos en el bloque, los usamos; de lo contrario, usamos un valor por defecto.
      this.formData = this.section.data && this.section.data.title
        ? {
            title: this.section.data.title,
            subtitle: this.section.data.subtitle,
            selectionType: this.section.data.selectionType || 'single',
            options: this.section.data.options || [{ id: this.optionCounter++, label: '' }]
          }
        : {
            title: '',
            subtitle: '',
            selectionType: 'single',
            options: [{ id: this.optionCounter++, label: '' }]
          };
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


  updateForm() {
    this.globalFormService.setMultipleChoiceData(this.formData);
  }

  addOption() {
    this.formData.options.push({ id: this.optionCounter++, label: '' });
    this.updateFormData();
  }

  removeOption(id: number) {
    // No permitir eliminar si es la última opción
    if (this.formData.options.length <= 1) {
      return;
    }
    this.formData.options = this.formData.options.filter(opt => opt.id !== id);
    this.updateFormData();
  }

  updateOptionLabel(id: number, label: string) {
    const option = this.formData.options.find(opt => opt.id === id);
    if (option) {
      option.label = label;
      this.updateFormData();
    }
  }

  updateSelectionType(type: 'single' | 'multiple') {
    this.formData.selectionType = type;
    this.updateFormData();
  }
}
