import { Component, Input, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ThankYouSection } from '../../../models/section.model';
import { StudyStateService } from '../../../services/study-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-thank-you-preview',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './thank-you-preview.component.html',
  styleUrls: ['./thank-you-preview.component.css']
})
export class ThankYouPreviewComponent implements OnInit, OnDestroy {
  @Input() section!: ThankYouSection;

  private destroy$ = new Subject<void>();

  previewData = {
    title: '',
    description: '',
  };

  constructor(private studyState: StudyStateService) {}

  ngOnInit(): void {
    // Subscribe to thank you section changes
    this.studyState.thankYouSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        if (section) {
          this.updatePreviewData(section);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.updatePreviewData(this.section);
      this.studyState.setThankYouSection(this.section);
    }
  }

  private updatePreviewData(section: ThankYouSection) {
    this.previewData = {
      title: section.title || 'No se ha ingresado el título',
      description: section.description || '',
    };
  }
}
