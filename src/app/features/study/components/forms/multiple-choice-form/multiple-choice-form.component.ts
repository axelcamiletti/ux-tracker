import { Component, Input, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
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
    FormsModule
  ],
  templateUrl: './multiple-choice-form.component.html',
  styleUrl: './multiple-choice-form.component.css'
})
export class MultipleChoiceFormComponent implements OnInit, OnDestroy {
  @Input() section!: MultipleChoiceSection;

  private destroy$ = new Subject<void>();
  private optionIdCounter = 0;

  constructor(private studyState: StudyStateService) {}

  ngOnInit() {
    this.studyState.multipleChoiceSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        if (section) {
          this.section = section;
          this.updateOptionIdCounter();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      if (!this.section.data.options) {
        this.section.data.options = [];
      }
      this.updateOptionIdCounter();
      this.studyState.setMultipleChoiceSection(this.section);
    }
  }

  private updateOptionIdCounter() {
    // Set the counter to the highest current ID + 1
    this.optionIdCounter = Math.max(
      ...this.section.data.options.map(o => parseInt(o.id.replace('option-', ''))),
      -1
    ) + 1;
  }

  onTitleChange(newTitle: string): void {
    this.section.title = newTitle;
    this.studyState.setMultipleChoiceSection(this.section);
  }

  onDescriptionChange(newDescription: string): void {
    this.section.description = newDescription;
    this.studyState.setMultipleChoiceSection(this.section);
  }

  updateAllowMultiple(value: boolean): void {
    this.section.data.allowMultiple = value;
    this.studyState.setMultipleChoiceSection(this.section);
  }

  addOption(): void {
    if (!this.section.data.options) {
      this.section.data.options = [];
    }

    const newOption = {
      id: `option-${this.optionIdCounter++}`,
      text: ''
    };

    this.section.data.options.push(newOption);
    this.studyState.setMultipleChoiceSection(this.section);
  }

  removeOption(optionId: string): void {
    if (this.section.data.options.length > 1) {
      this.section.data.options = this.section.data.options.filter(o => o.id !== optionId);
      this.studyState.setMultipleChoiceSection(this.section);
    }
  }

  updateOptionText(optionId: string, newText: string): void {
    const option = this.section.data.options.find(o => o.id === optionId);
    if (option) {
      option.text = newText;
      this.studyState.setMultipleChoiceSection(this.section);
    }
  }
}
