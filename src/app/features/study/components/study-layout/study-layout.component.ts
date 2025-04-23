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
    console.log('StudyLayoutComponent: Inicializando...');
    this.studyId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.studyId) {
      console.log('StudyLayoutComponent: No se encontró ID de estudio, redirigiendo...');
      this.router.navigate(['/projects']);
    } else {
      console.log('StudyLayoutComponent: Cargando estudio:', this.studyId);

      // Mantener el estudio actualizado
      this.studyService.getStudyById(this.studyId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (study) => {
            console.log('StudyLayoutComponent: Estudio cargado:', study);
            this.studyService.setCurrentStudy(study);

            // Una vez que el estudio está cargado, suscribirse a los estados de guardado
            this.studyState.saving$
              .pipe(takeUntil(this.destroy$))
              .subscribe(saving => {
                console.log('StudyLayoutComponent: Estado de guardado actualizado:', saving);
                this.saving = saving;
              });

            this.studyState.lastSaved$
              .pipe(takeUntil(this.destroy$))
              .subscribe(date => {
                console.log('StudyLayoutComponent: Última fecha de guardado actualizada:', date);
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
    console.log('StudyLayoutComponent: Iniciando guardado manual...');
    if (this.studyId) {
      this.studyState.saveStudy(this.studyId);
    } else {
      console.log('StudyLayoutComponent: No hay ID de estudio para guardar');
    }
  }
}
