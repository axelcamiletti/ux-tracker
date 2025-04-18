import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YesNoPreviewComponent } from './yes-no-preview.component';

describe('YesNoPreviewComponent', () => {
  let component: YesNoPreviewComponent;
  let fixture: ComponentFixture<YesNoPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YesNoPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YesNoPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
