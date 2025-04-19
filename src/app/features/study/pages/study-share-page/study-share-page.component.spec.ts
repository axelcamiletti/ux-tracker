import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudySharePageComponent } from './study-share-page.component';

describe('StudySharePageComponent', () => {
  let component: StudySharePageComponent;
  let fixture: ComponentFixture<StudySharePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudySharePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudySharePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
