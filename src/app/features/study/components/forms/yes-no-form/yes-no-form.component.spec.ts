import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YesNoFormComponent } from './yes-no-form.component';

describe('YesNoFormComponent', () => {
  let component: YesNoFormComponent;
  let fixture: ComponentFixture<YesNoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YesNoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YesNoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
