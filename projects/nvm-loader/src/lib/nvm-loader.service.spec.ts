import { TestBed, inject } from '@angular/core/testing';

import { NvmLoaderService } from './nvm-loader.service';

describe('NvmLoaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NvmLoaderService]
    });
  });

  it('should be created', inject([NvmLoaderService], (service: NvmLoaderService) => {
    expect(service).toBeTruthy();
  }));
});
