import { TestBed } from '@angular/core/testing';

import { TourOptimizationService } from './TourOptimizationService';

describe('TourOptimizationService', () => {
  let service: TourOptimizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TourOptimizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
