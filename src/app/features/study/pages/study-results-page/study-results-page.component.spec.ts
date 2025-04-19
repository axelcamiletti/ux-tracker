import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyResultsPageComponent } from './study-results-page.component';

describe('StudyResultsPageComponent', () => {
  let component: StudyResultsPageComponent;
  let fixture: ComponentFixture<StudyResultsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyResultsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudyResultsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
