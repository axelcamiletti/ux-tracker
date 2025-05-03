import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrototypeIframePreviewComponent } from './prototype-iframe-preview.component';

describe('PrototypeIframePreviewComponent', () => {
  let component: PrototypeIframePreviewComponent;
  let fixture: ComponentFixture<PrototypeIframePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrototypeIframePreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrototypeIframePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
