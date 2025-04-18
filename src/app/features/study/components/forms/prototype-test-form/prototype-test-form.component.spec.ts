import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrototypeTestFormComponent } from './prototype-test-form.component';

describe('PrototypeTestFormComponent', () => {
  let component: PrototypeTestFormComponent;
  let fixture: ComponentFixture<PrototypeTestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrototypeTestFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrototypeTestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
