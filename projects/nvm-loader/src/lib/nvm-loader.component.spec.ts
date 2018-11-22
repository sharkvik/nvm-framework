import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NvmLoaderComponent } from './nvm-loader.component';

describe('NvmLoaderComponent', () => {
  let component: NvmLoaderComponent;
  let fixture: ComponentFixture<NvmLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NvmLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NvmLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
