import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MainToolbarComponent } from "../../components/main-toolbar/main-toolbar.component";
import { MainSidebarComponent } from "../../components/main-sidebar/main-sidebar.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MainToolbarComponent, MainSidebarComponent, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
 
}
