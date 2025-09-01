import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoCartComponent } from './producto-cart.component';

describe('ProductoCartComponent', () => {
  let component: ProductoCartComponent;
  let fixture: ComponentFixture<ProductoCartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductoCartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductoCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
