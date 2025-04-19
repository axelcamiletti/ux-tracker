import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Section } from '../../../models/section.model';
import { ParticipantResult } from '../../../models/participant-result.model';

@Component({
  selector: 'app-yes-no-result',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './yes-no-result.component.html',
  styleUrl: './yes-no-result.component.css'
})
export class YesNoResultComponent {
  @Input() section!: Section;
  @Input() title: string = '';
  @Input() responses: ParticipantResult[] = [];
}
