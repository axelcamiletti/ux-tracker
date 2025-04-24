import { TestBed } from '@angular/core/testing';

import { FigmaService } from '../features/study/services/figma.service';

describe('FigmaService', () => {
  let service: FigmaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FigmaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
