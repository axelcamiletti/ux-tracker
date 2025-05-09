import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProjectService } from '../../features/projects/services/project.service';

@Component({
  selector: 'app-main-sidebar',
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule, MatDividerModule, MatTooltipModule],
  templateUrl: './main-sidebar.component.html',
  styleUrl: './main-sidebar.component.css'
})
export class MainSidebarComponent {
  private projectService = inject(ProjectService);

  isCollapsed = false;
  protected workspaces = this.projectService.projects;

  ngOnInit() {
    this.projectService.loadProjects();
  }
}
