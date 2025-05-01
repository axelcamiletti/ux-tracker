import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { StudyService } from '../../services/study.service';
import { CommonModule } from '@angular/common';
import { StudyStateService } from '../../services/study-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-study-layout',
  standalone: true,
  imports: [CommonModule, ToolbarComponent, RouterOutlet],
  templateUrl: './study-layout.component.html',
  styleUrl: './study-layout.component.css'
})
export class StudyLayoutComponent implements OnInit, OnDestroy {
  studyId: string = '';
  saving = false;
  lastSaved: Date | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studyService: StudyService,
    private studyState: StudyStateService
  ) {}

  ngOnInit() {
    this.studyId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.studyId) {
      this.router.navigate(['/projects']);
    } else {

      // Mantener el estudio actualizado
      this.studyService.getStudyById(this.studyId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (study) => {
            this.studyService.setCurrentStudy(study);

            // Una vez que el estudio está cargado, suscribirse a los estados de guardado
            this.studyState.saving$
              .pipe(takeUntil(this.destroy$))
              .subscribe(saving => {
                this.saving = saving;
              });

            this.studyState.lastSaved$
              .pipe(takeUntil(this.destroy$))
              .subscribe(date => {
                this.lastSaved = date;
              });
          },
          error: (error) => {
            console.error('StudyLayoutComponent: Error al cargar el estudio:', error);
            this.router.navigate(['/projects']);
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  saveStudy() {
    if (this.studyId) {
      this.studyState.saveStudy(this.studyId);
    } else {
    }
  }
}
