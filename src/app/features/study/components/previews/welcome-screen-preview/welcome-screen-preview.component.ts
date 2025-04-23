import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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

  previewData = {
    title: '¡Hola!',
    description: 'Has sido invitado a compartir tus opiniones, ideas y puntos de vista.',
  };

  private destroy$ = new Subject<void>();

  constructor(private studyState: StudyStateService) {}

  ngOnInit(): void {
    // Subscribe to welcome section changes for real-time updates
    this.studyState.welcomeSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        if (section) {
          this.previewData = {
            title: section.title || '¡Hola!',
            description: section.description || 'Has sido invitado a compartir tus opiniones, ideas y puntos de vista.',
          };
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(): void {
    if (this.section) {
      this.previewData = {
        title: this.section.title || '¡Hola!',
        description: this.section.description || 'Has sido invitado a compartir tus opiniones, ideas y puntos de vista.',
      };
    }
  }
}
