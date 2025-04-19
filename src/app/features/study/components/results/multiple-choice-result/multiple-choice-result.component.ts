import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-multiple-choice-result',
  imports: [MatIconModule, CommonModule],
  templateUrl: './multiple-choice-result.component.html',
  styleUrl: './multiple-choice-result.component.css'
})
export class MultipleChoiceResultComponent {
  @Input() title: string = 'Yes/no example';

  options = [
    { name: 'Lagarto' },
    { name: 'Perrito faldero' },
    { name: 'Gatito chato' }
  ]

  responses = [
    {
      id: 1,
      name: 'Participant 1',
      response: 'Lagarto',
      respondedAt: '2024-01-01 12:00:00'
    },
    {
      id: 2,
      name: 'Participant 2',
      response: 'Perrito faldero',
      respondedAt: '2024-01-01 11:00:00'
    },
    {
      id: 3,
      name: 'Participant 3',
      response: 'Gatito chato',
      respondedAt: '2024-01-01 10:00:00'
    },
    
  ]
}
