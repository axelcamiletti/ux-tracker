import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenQuestionResultComponent } from './open-question-result.component';

describe('OpenQuestionResultComponent', () => {
  let component: OpenQuestionResultComponent;
  let fixture: ComponentFixture<OpenQuestionResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenQuestionResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenQuestionResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
