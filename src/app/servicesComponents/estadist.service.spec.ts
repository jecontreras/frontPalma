import { TestBed } from '@angular/core/testing';

import { EstadistService } from './estadist.service';

describe('EstadistService', () => {
  let service: EstadistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
