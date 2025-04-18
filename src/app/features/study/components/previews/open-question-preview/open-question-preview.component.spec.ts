import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenQuestionPreviewComponent } from './open-question-preview.component';

describe('OpenQuestionPreviewComponent', () => {
  let component: OpenQuestionPreviewComponent;
  let fixture: ComponentFixture<OpenQuestionPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenQuestionPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenQuestionPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
