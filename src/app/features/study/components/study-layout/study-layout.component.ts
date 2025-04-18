import { Component, OnInit } from '@angular/core';
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

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
  ) {}

  ngOnInit() {
    this.studyId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.studyId) {
      this.router.navigate(['/projects']);
    }
  }
}
