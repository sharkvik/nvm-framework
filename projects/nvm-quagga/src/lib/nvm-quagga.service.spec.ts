import { TestBed, inject } from '@angular/core/testing';

import { NvmQuaggaService } from './nvm-quagga.service';

describe('NvmQuaggaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NvmQuaggaService]
    });
  });

  it('should be created', inject([NvmQuaggaService], (service: NvmQuaggaService) => {
    expect(service).toBeTruthy();
  }));
});
