import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleChoiceResultComponent } from './multiple-choice-result.component';

describe('MultipleChoiceResultComponent', () => {
  let component: MultipleChoiceResultComponent;
  let fixture: ComponentFixture<MultipleChoiceResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultipleChoiceResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultipleChoiceResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
