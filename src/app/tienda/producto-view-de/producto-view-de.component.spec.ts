import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoViewDeComponent } from './producto-view-de.component';

describe('ProductoViewDeComponent', () => {
  let component: ProductoViewDeComponent;
  let fixture: ComponentFixture<ProductoViewDeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductoViewDeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductoViewDeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
