import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigFormCompraComponent } from './config-form-compra.component';

describe('ConfigFormCompraComponent', () => {
  let component: ConfigFormCompraComponent;
  let fixture: ComponentFixture<ConfigFormCompraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigFormCompraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigFormCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
