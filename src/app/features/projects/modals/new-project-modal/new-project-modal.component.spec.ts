import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewProjectModalComponent } from './new-project-modal.component';

describe('NewProjectModalComponent', () => {
  let component: NewProjectModalComponent;
  let fixture: ComponentFixture<NewProjectModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewProjectModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewProjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
