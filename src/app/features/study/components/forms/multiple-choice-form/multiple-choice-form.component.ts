import { Component, Input, SimpleChanges, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MultipleChoiceSection } from '../../../models/section.model';
import { StudyStateService } from '../../../services/study-state.service';
import { Subject, takeUntil } from 'rxjs';
import { IconSectionComponent } from "../../icon-section/icon-section.component";

@Component({
  selector: 'app-multiple-choice-form',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatTooltipModule,
    MatRadioModule,
    FormsModule,
    IconSectionComponent
],
  templateUrl: './multiple-choice-form.component.html',
  styleUrl: './multiple-choice-form.component.css'
})
export class MultipleChoiceFormComponent implements OnInit, OnDestroy {
  @Input() section!: MultipleChoiceSection;

  private destroy$ = new Subject<void>();
  private studyState = inject(StudyStateService);
  private optionIdCounter = 0;

  formData = signal({
    title: '',
    description: '',
    allowMultiple: false,
    options: [] as { id: string; text: string }[]
  });

  ngOnInit() {
    this.studyState.multipleChoiceSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        if (section) {
          this.section = section;
          this.updateFormData(section);
          this.updateOptionIdCounter();
        }
      });

    // Inicializar con 3 opciones por defecto si no hay opciones
    if ((!this.section.data.options || this.section.data.options.length === 0) &&
        this.formData().options.length === 0) {
      this.initializeDefaultOptions();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      if (!this.section.data.options) {
        this.section.data.options = [];
        this.initializeDefaultOptions();
      } else if (this.section.data.options.length === 0) {
        this.initializeDefaultOptions();
      } else {
        this.updateFormData(this.section);
        this.updateOptionIdCounter();
      }
      this.studyState.setMultipleChoiceSection({...this.section});
    }
  }

  private updateFormData(section: MultipleChoiceSection) {
    this.formData.set({
      title: section.title || '',
      description: section.description || '',
      allowMultiple: section.data.allowMultiple || false,
      options: section.data.options || []
    });
  }

  private initializeDefaultOptions() {
    const defaultOptions = [
      { id: `option-${this.optionIdCounter++}`, text: 'Opción 1' },
      { id: `option-${this.optionIdCounter++}`, text: 'Opción 2' },
      { id: `option-${this.optionIdCounter++}`, text: 'Opción 3' }
    ];

    if (!this.section.data.options) {
      this.section.data.options = [];
    }

    this.section.data.options = defaultOptions;

    this.formData.update(current => ({
      ...current,
      options: defaultOptions
    }));
  }

  private updateOptionIdCounter() {
    if (!this.section.data.options || this.section.data.options.length === 0) {
      this.optionIdCounter = 0;
      return;
    }

    // Set the counter to the highest current ID + 1
    this.optionIdCounter = Math.max(
      ...this.section.data.options.map(o => parseInt(o.id.replace('option-', ''))),
      -1
    ) + 1;
  }

  onTitleChange(newTitle: string): void {
    this.formData.update(current => ({
      ...current,
      title: newTitle
    }));

    this.section.title = newTitle;
    this.studyState.setMultipleChoiceSection({...this.section});
  }

  onDescriptionChange(newDescription: string): void {
    this.formData.update(current => ({
      ...current,
      description: newDescription
    }));

    this.section.description = newDescription;
    this.studyState.setMultipleChoiceSection({...this.section});
  }

  updateAllowMultiple(value: boolean): void {
    this.formData.update(current => ({
      ...current,
      allowMultiple: value
    }));

    this.section.data.allowMultiple = value;
    this.studyState.setMultipleChoiceSection({...this.section});
  }

  addOption(): void {
    if (!this.section.data.options) {
      this.section.data.options = [];
    }

    const newOption = {
      id: `option-${this.optionIdCounter++}`,
      text: ''
    };

    const updatedOptions = [...this.section.data.options, newOption];

    this.formData.update(current => ({
      ...current,
      options: updatedOptions
    }));

    this.section.data.options = updatedOptions;
    this.studyState.setMultipleChoiceSection({...this.section});
  }

  removeOption(optionId: string): void {
    if (this.section.data.options.length > 1) {
      const updatedOptions = this.section.data.options.filter(o => o.id !== optionId);

      this.formData.update(current => ({
        ...current,
        options: updatedOptions
      }));

      this.section.data.options = updatedOptions;
      this.studyState.setMultipleChoiceSection({...this.section});
    }
  }

  updateOptionText(optionId: string, newText: string): void {
    const option = this.section.data.options.find(o => o.id === optionId);
    if (option) {
      option.text = newText;

      this.formData.update(current => ({
        ...current,
        options: [...this.section.data.options]
      }));

      this.studyState.setMultipleChoiceSection({...this.section});
    }
  }
}
