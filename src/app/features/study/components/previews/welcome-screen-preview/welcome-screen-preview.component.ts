import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { WelcomeScreenSection } from '../../../models/section.model';
import { StudyStateService } from '../../../services/study-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-welcome-screen-preview',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './welcome-screen-preview.component.html',
  styleUrl: './welcome-screen-preview.component.css'
})
export class WelcomeScreenPreviewComponent implements OnInit, OnDestroy {
  @Input() section!: WelcomeScreenSection;

  previewData = signal({
    title: '¡Hola!',
    description: 'Has sido invitado a compartir tus opiniones, ideas y puntos de vista.',
  });

  private destroy$ = new Subject<void>();
  private studyState = inject(StudyStateService);

  ngOnInit(): void {
    this.studyState.welcomeSection$
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

  ngOnChanges(): void {
    if (this.section) {
      this.updatePreviewData(this.section);
      this.studyState.setWelcomeSection(this.section);
    }
  }

  private updatePreviewData(section: WelcomeScreenSection): void {
    this.previewData.set({
      title: section.title || '¡Hola!',
      description: section.description || 'Has sido invitado a compartir tus opiniones, ideas y puntos de vista.',
    });
  }
}
