import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipElementComponent } from './clip-element.component';

describe('ClipElementComponent', () => {
  let component: ClipElementComponent;
  let fixture: ComponentFixture<ClipElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClipElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClipElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
