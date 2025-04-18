import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleChoiceFormComponent } from './multiple-choice-form.component';

describe('MultipleChoiceFormComponent', () => {
  let component: MultipleChoiceFormComponent;
  let fixture: ComponentFixture<MultipleChoiceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultipleChoiceFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultipleChoiceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
