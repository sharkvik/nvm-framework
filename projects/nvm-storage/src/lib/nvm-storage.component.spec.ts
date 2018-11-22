import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NvmStorageComponent } from './nvm-storage.component';

describe('NvmStorageComponent', () => {
  let component: NvmStorageComponent;
  let fixture: ComponentFixture<NvmStorageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NvmStorageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NvmStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
