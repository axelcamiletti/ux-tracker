import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenDetailsDialogComponent } from './screen-details-dialog.component';

describe('ScreenDetailsDialogComponent', () => {
  let component: ScreenDetailsDialogComponent;
  let fixture: ComponentFixture<ScreenDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
