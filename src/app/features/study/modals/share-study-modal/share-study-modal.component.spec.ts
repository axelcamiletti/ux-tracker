import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareStudyModalComponent } from './share-study-modal.component';

describe('ShareStudyModalComponent', () => {
  let component: ShareStudyModalComponent;
  let fixture: ComponentFixture<ShareStudyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareStudyModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareStudyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
