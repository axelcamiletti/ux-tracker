import { TestBed } from '@angular/core/testing';

import { GlobalFormService } from './global-form.service';

describe('GlobalFormService', () => {
  let service: GlobalFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
