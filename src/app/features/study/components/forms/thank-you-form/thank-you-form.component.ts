import { Component, Input, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { ThankYouSection } from '../../../models/section.model';
import { StudyStateService } from '../../../services/study-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-thank-you-form',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './thank-you-form.component.html',
  styleUrl: './thank-you-form.component.css'
})
export class ThankYouFormComponent implements OnInit, OnDestroy {
  @Input() section!: ThankYouSection;

  private destroy$ = new Subject<void>();

  formData = {
    title: '',
    description: '',
    imageUrl: ''
  };

  constructor(private studyState: StudyStateService) {}

  ngOnInit() {
    this.studyState.thankYouSection$
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
      this.studyState.setThankYouSection(this.section);
    }
  }

  private updateFormDataFromSection(section: ThankYouSection) {
    this.formData = {
      title: section.title || '',
      description: section.description || '',
      imageUrl: section.data.imageUrl || ''
    };
  }

  onTitleChange(newTitle: string): void {
    this.formData.title = newTitle;
    this.section.title = newTitle;
    this.studyState.setThankYouSection(this.section);
  }

  onDescriptionChange(newDescription: string): void {
    this.formData.description = newDescription;
    this.section.description = newDescription;
    this.studyState.setThankYouSection(this.section);
  }

  onImageUrlChange(newImageUrl: string): void {
    this.formData.imageUrl = newImageUrl;
    this.section.data = {
      ...this.section.data,
      imageUrl: newImageUrl
    };
    this.studyState.setThankYouSection(this.section);
  }
}
