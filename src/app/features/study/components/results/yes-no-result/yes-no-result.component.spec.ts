import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YesNoResultComponent } from './yes-no-result.component';

describe('YesNoResultComponent', () => {
  let component: YesNoResultComponent;
  let fixture: ComponentFixture<YesNoResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YesNoResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YesNoResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
