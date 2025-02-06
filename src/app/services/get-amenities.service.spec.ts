import { TestBed } from '@angular/core/testing';

import { GetAmenitiesService } from './get-amenities.service';

describe('GetAmenitiesService', () => {
  let service: GetAmenitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetAmenitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
