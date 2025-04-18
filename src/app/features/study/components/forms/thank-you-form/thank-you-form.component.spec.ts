import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThankYouFormComponent } from './thank-you-form.component';

describe('ThankYouFormComponent', () => {
  let component: ThankYouFormComponent;
  let fixture: ComponentFixture<ThankYouFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThankYouFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThankYouFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
