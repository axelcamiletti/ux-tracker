import { Component } from '@angular/core';
import { HeatmapSectionComponent } from "../../components/sections/heatmap-section/heatmap-section.component";
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClipElementComponent } from "../../components/clip-element/clip-element.component";

@Component({
  selector: 'app-screen-details-dialog',
  imports: [HeatmapSectionComponent, MatIconModule, MatTooltipModule],
  templateUrl: './screen-details-dialog.component.html',
  styleUrl: './screen-details-dialog.component.css'
})
export class ScreenDetailsDialogComponent {

}
