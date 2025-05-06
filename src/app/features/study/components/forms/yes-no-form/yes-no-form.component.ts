import { Component, Input, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { YesNoSection } from '../../../models/section.model';
import { StudyStateService } from '../../../services/study-state.service';
import { Subject, takeUntil } from 'rxjs';
import { IconSectionComponent } from "../../icon-section/icon-section.component";

type ButtonStyle = 'default' | 'emoji' | 'thumbs';

@Component({
  selector: 'app-yes-no-form',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatTooltipModule,
    FormsModule,
    IconSectionComponent
],
  templateUrl: './yes-no-form.component.html',
  styleUrl: './yes-no-form.component.css'
})
export class YesNoFormComponent implements OnInit, OnDestroy {
  @Input() section!: YesNoSection;

  selectedOption: 'yes' | 'no' | null = null;
  private destroy$ = new Subject<void>();

  formData = {
    title: '',
    description: '',
    required: false,
    yesLabel: 'Sí',
    noLabel: 'No',
    yesDescription: '',
    noDescription: '',
    buttonStyle: 'default' as ButtonStyle
  };

  constructor(private studyState: StudyStateService) {}

  ngOnInit() {
    // Subscribe to yes-no section changes
    this.studyState.yesNoSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        if (section) {
          this.updateFormDataFromSection(section);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.updateFormDataFromSection(this.section);
    }
  }

  private updateFormDataFromSection(section: YesNoSection) {
    this.formData = {
      title: section.title || 'Title not entered',
      description: section.description || '',
      required: section.required || false,
      yesLabel: section.data.yesLabel || 'Sí',
      noLabel: section.data.noLabel || 'No',
      yesDescription: section.data.yesDescription || '',
      noDescription: section.data.noDescription || '',
      buttonStyle: section.data.buttonStyle || 'default'
    };
    this.selectedOption = section.data.selectedOption || null;
  }

  onTitleChange(newTitle: string): void {
    this.formData.title = newTitle;
    this.section.title = newTitle;
    this.studyState.setYesNoSection(this.section);
  }

  onSubtitleChange(newDescription: string): void {
    this.formData.description = newDescription;
    this.section.description = newDescription;
    this.studyState.setYesNoSection(this.section);
  }

  onSelectedOptionChange(option: 'yes' | 'no'): void {
    this.selectedOption = option;
    this.section.data = {
      ...this.section.data,
      selectedOption: option
    };
    this.studyState.setYesNoSection(this.section);
  }

  onLabelChange(type: 'yes' | 'no', value: string): void {
    if (type === 'yes') {
      this.formData.yesLabel = value;
      this.section.data = {
        ...this.section.data,
        yesLabel: value
      };
    } else {
      this.formData.noLabel = value;
      this.section.data = {
        ...this.section.data,
        noLabel: value
      };
    }
    this.studyState.setYesNoSection(this.section);
  }

  onDescriptionChange(type: 'yes' | 'no', value: string): void {
    if (type === 'yes') {
      this.formData.yesDescription = value;
      this.section.data = {
        ...this.section.data,
        yesDescription: value
      };
    } else {
      this.formData.noDescription = value;
      this.section.data = {
        ...this.section.data,
        noDescription: value
      };
    }
    this.studyState.setYesNoSection(this.section);
  }

  onButtonStyleChange(style: ButtonStyle): void {
    this.formData.buttonStyle = style;
    this.section.data = {
      ...this.section.data,
      buttonStyle: style
    };
    this.studyState.setYesNoSection(this.section);
  }
}
