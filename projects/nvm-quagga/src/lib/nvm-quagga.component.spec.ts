import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NvmQuaggaComponent } from './nvm-quagga.component';

describe('NvmQuaggaComponent', () => {
  let component: NvmQuaggaComponent;
  let fixture: ComponentFixture<NvmQuaggaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NvmQuaggaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NvmQuaggaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
