import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { YesNoSection } from '../../../models/section.model';
import { YesNoResponse } from '../../../models/study-response.model';
import { StudyStateService } from '../../../services/study-state.service';
import { Subject, takeUntil } from 'rxjs';

type ButtonStyle = 'default' | 'emoji' | 'thumbs';

@Component({
  selector: 'app-yes-no-preview',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './yes-no-preview.component.html',
  styleUrl: './yes-no-preview.component.css'
})
export class YesNoPreviewComponent implements OnInit, OnDestroy {
  @Input() section!: YesNoSection;
  @Output() responseChange = new EventEmitter<YesNoResponse>();

  selectedOption: 'yes' | 'no' | null = null;
  private destroy$ = new Subject<void>();

  previewData = {
    title: '',
    description: '',
    required: false,
    yesLabel: '',
    noLabel: '',
    yesDescription: '',
    noDescription: '',
    buttonStyle: 'default' as ButtonStyle
  };

  constructor(private studyState: StudyStateService) {}

  ngOnInit(): void {
    // Subscribe to yes-no section changes
    this.studyState.yesNoSection$
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
      this.studyState.setYesNoSection(this.section);
    }
  }

  private updatePreviewData(section: YesNoSection) {
    this.previewData = {
      title: section.title || '',
      description: section.description || '',
      required: section.required,
      yesLabel: section.data.yesLabel || 'Sí',
      noLabel: section.data.noLabel || 'No',
      yesDescription: section.data.yesDescription || '',
      noDescription: section.data.noDescription || '',
      buttonStyle: section.data.buttonStyle || 'default'
    };
  }

  selectOption(option: 'yes' | 'no') {
    this.selectedOption = option;
    this.emitResponse();
  }

  private emitResponse() {
    if (this.selectedOption) {
      const response: YesNoResponse = {
        sectionId: this.section.id,
        timestamp: new Date(),
        type: 'yes-no',
        response: {
          answer: this.selectedOption === 'yes'
        }
      };
      this.responseChange.emit(response);
    }
  }
}
