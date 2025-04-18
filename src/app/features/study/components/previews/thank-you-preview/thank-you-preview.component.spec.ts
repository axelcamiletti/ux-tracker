import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThankYouPreviewComponent } from './thank-you-preview.component';

describe('ThankYouPreviewComponent', () => {
  let component: ThankYouPreviewComponent;
  let fixture: ComponentFixture<ThankYouPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThankYouPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThankYouPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
