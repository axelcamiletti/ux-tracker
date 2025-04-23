import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantResultComponent } from './participant-result.component';

describe('ParticipantResultComponent', () => {
  let component: ParticipantResultComponent;
  let fixture: ComponentFixture<ParticipantResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
