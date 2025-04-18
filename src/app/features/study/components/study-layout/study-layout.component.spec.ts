import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyLayoutComponent } from './study-layout.component';

describe('StudyLayoutComponent', () => {
  let component: StudyLayoutComponent;
  let fixture: ComponentFixture<StudyLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudyLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
