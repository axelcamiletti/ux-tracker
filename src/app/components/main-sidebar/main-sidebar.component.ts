import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-main-sidebar',
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule, MatDividerModule, MatTooltipModule],
  templateUrl: './main-sidebar.component.html',
  styleUrl: './main-sidebar.component.css'
})
export class MainSidebarComponent {
  isCollapsed = false;

  sidebarLinks = [
    {
      path: '/',
      icon: 'home',
      label: 'Home'
    },
    {
      path: '/projects',
      icon: 'folder',
      label: 'Projects'
    }
  ]
}
