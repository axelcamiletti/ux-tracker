import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeScreenFormComponent } from './welcome-screen-form.component';

describe('WelcomeScreenFormComponent', () => {
  let component: WelcomeScreenFormComponent;
  let fixture: ComponentFixture<WelcomeScreenFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeScreenFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WelcomeScreenFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
