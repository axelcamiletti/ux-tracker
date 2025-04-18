import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyAnalyticsPageComponent } from './study-analytics-page.component';

describe('StudyAnalyticsPageComponent', () => {
  let component: StudyAnalyticsPageComponent;
  let fixture: ComponentFixture<StudyAnalyticsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyAnalyticsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudyAnalyticsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
