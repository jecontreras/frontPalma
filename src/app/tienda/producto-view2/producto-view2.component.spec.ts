import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoView2Component } from './producto-view2.component';

describe('ProductoView2Component', () => {
  let component: ProductoView2Component;
  let fixture: ComponentFixture<ProductoView2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductoView2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductoView2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
