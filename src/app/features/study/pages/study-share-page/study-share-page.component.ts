import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ShareStudyModalComponent } from '../../modals/share-study-modal/share-study-modal.component';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-study-share-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './study-share-page.component.html',
  styleUrl: './study-share-page.component.css'
})
export class StudySharePageComponent {
  studyId: string = '';

  settings = [
    {
      title: 'Copy study link',
      description: 'Invite testers via your own channels',
      icon: 'https://app.maze.co/_next/static/media/maze-share-url.f064d024.png',
      action: () => this.openShareModal()
    },
    {
      title: 'Hire panel participants',
      description: 'Target 150k+ participants globally with 400+ filters',
      icon: 'https://app.maze.co/_next/static/media/maze-hire-testers.cebcb146.png'
    },
    {
      title: 'In-Product Prompt',
      description: 'Embed as a popover on your live website',
      icon: 'https://app.maze.co/_next/static/media/maze-create-prompt.a79fe39a.png'
    },
    {
      title: 'Send Reach Campaign',
      description: 'Email to a segment of your own testers',
      icon: 'https://app.maze.co/_next/static/media/send-via-reach.d18e6001.png'
    },
  ];

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {
    this.studyId = this.route.parent?.snapshot.paramMap.get('id') || '';
  }

  openShareModal() {
    const studyUrl = `${environment.baseUrl}/study-public/${this.studyId}`;
    
    this.dialog.open(ShareStudyModalComponent, {
      data: { studyUrl },
      width: '500px'
    });
  }
}
