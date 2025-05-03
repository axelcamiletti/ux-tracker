import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareStudyDialogComponent } from './share-study-dialog.component';

describe('ShareStudyDialogComponent', () => {
  let component: ShareStudyDialogComponent;
  let fixture: ComponentFixture<ShareStudyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareStudyDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareStudyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
