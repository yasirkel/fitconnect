import { TestBed } from '@angular/core/testing';

import { Clubs } from './clubs';

describe('Clubs', () => {
  let service: Clubs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Clubs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
