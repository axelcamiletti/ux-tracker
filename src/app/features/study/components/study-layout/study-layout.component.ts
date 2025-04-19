import { Component, OnInit } from '@angular/core';
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { StudyService } from '../../services/study.service';

@Component({
  selector: 'app-study-layout',
  imports: [ToolbarComponent, RouterOutlet],
  templateUrl: './study-layout.component.html',
  styleUrl: './study-layout.component.css'
})
export class StudyLayoutComponent implements OnInit {
  studyId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studyService: StudyService
  ) {}

  ngOnInit() {
    this.studyId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.studyId) {
      this.router.navigate(['/projects']);
    } else {
      // Cargar y establecer el estudio actual
      this.studyService.getStudyById(this.studyId).subscribe({
        next: (study) => {
          this.studyService.setCurrentStudy(study);
        },
        error: (error) => {
          console.error('Error al cargar el estudio:', error);
          this.router.navigate(['/projects']);
        }
      });
    }
  }
}
