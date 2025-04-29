import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Section } from '../../../models/section.model';
import { StudyResponse } from '../../../models/study-response.model';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-prototype-test-result',
  imports: [CommonModule, MatIconModule, MatTooltipModule, MatButtonModule],
  templateUrl: './prototype-test-result.component.html',
  styleUrl: './prototype-test-result.component.css'
})
export class PrototypeTestResultComponent {
  @Input() section!: Section;
  @Input() title: string = '';
  @Input() participants: StudyResponse[] = [];

  missionScreens:[] = [];
  ngOnChanges() {
  }
}
