import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCreationPageComponent } from './study-creation-page.component';

describe('StudyCreationPageComponent', () => {
  let component: StudyCreationPageComponent;
  let fixture: ComponentFixture<StudyCreationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyCreationPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudyCreationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
