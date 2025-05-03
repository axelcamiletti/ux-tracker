import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatmapSectionComponent } from './heatmap-section.component';

describe('HeatmapSectionComponent', () => {
  let component: HeatmapSectionComponent;
  let fixture: ComponentFixture<HeatmapSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeatmapSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeatmapSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
