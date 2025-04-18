import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeScreenPreviewComponent } from './welcome-screen-preview.component';

describe('WelcomeScreenPreviewComponent', () => {
  let component: WelcomeScreenPreviewComponent;
  let fixture: ComponentFixture<WelcomeScreenPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeScreenPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WelcomeScreenPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
