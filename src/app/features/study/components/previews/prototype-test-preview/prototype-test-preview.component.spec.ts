import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrototypeTestPreviewComponent } from './prototype-test-preview.component';

describe('PrototypeTestPreviewComponent', () => {
  let component: PrototypeTestPreviewComponent;
  let fixture: ComponentFixture<PrototypeTestPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrototypeTestPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrototypeTestPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
