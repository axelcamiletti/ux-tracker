import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-yes-no-result',
  imports: [MatIconModule, CommonModule],
  templateUrl: './yes-no-result.component.html',
  styleUrl: './yes-no-result.component.css'
})
export class YesNoResultComponent {
  @Input() title: string = 'Yes/no example';

  responses = [
    {
      id: 1,
      name: 'Participant 1',
      response: 'yes',
      respondedAt: '2024-01-01 12:00:00'
    },
    {
      id: 2,
      name: 'Participant 2',
      response: 'no',
      respondedAt: '2024-01-01 11:00:00'
    },
    {
      id: 3,
      name: 'Participant 3',
      response: 'no',
      respondedAt: '2024-01-01 10:00:00'
    },
    
  ]
}
