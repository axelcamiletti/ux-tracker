import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrototypeTestResultComponent } from './prototype-test-result.component';

describe('PrototypeTestResultComponent', () => {
  let component: PrototypeTestResultComponent;
  let fixture: ComponentFixture<PrototypeTestResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrototypeTestResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrototypeTestResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
