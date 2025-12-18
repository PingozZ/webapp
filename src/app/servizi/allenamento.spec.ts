import { TestBed } from '@angular/core/testing';

import { Allenamento } from './allenamento';

describe('Allenamento', () => {
  let service: Allenamento;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Allenamento);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
