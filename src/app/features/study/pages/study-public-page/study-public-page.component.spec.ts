import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyPublicPageComponent } from './study-public-page.component';

describe('StudyPublicPageComponent', () => {
  let component: StudyPublicPageComponent;
  let fixture: ComponentFixture<StudyPublicPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyPublicPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudyPublicPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
