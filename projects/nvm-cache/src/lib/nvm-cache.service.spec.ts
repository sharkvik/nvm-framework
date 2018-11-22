import { TestBed, inject } from '@angular/core/testing';

import { NvmCacheService } from './nvm-cache.service';

describe('NvmCacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NvmCacheService]
    });
  });

  it('should be created', inject([NvmCacheService], (service: NvmCacheService) => {
    expect(service).toBeTruthy();
  }));
});
