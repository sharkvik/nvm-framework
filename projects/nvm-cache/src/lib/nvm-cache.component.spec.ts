import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NvmCacheComponent } from './nvm-cache.component';

describe('NvmCacheComponent', () => {
  let component: NvmCacheComponent;
  let fixture: ComponentFixture<NvmCacheComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NvmCacheComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NvmCacheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
