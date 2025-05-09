import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleChoicePreviewComponent } from './multiple-choice-preview.component';

describe('MultipleChoicePreviewComponent', () => {
  let component: MultipleChoicePreviewComponent;
  let fixture: ComponentFixture<MultipleChoicePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultipleChoicePreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultipleChoicePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
