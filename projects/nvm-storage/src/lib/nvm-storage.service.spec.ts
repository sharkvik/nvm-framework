import { TestBed, inject } from '@angular/core/testing';

import { NvmStorageService } from './nvm-storage.service';

describe('NvmStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NvmStorageService]
    });
  });

  it('should be created', inject([NvmStorageService], (service: NvmStorageService) => {
    expect(service).toBeTruthy();
  }));
});
