import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-open-question-result',
  imports: [MatIconModule, CommonModule],
  templateUrl: './open-question-result.component.html',
  styleUrl: './open-question-result.component.css'
})
export class OpenQuestionResultComponent {
  @Input() title: string = 'asdasd';

  responses = [
    {
      id: 1,
      name: 'Participant 1',
      response: 'Lorem ipsum dolor sit amet consectetur.'
    },
    {
      id: 2,
      name: 'Participant 2',
      response: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.'
    },
    
  ]
}
