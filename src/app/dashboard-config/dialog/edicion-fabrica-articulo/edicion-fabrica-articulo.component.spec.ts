import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicionFabricaArticuloComponent } from './edicion-fabrica-articulo.component';

describe('EdicionFabricaArticuloComponent', () => {
  let component: EdicionFabricaArticuloComponent;
  let fixture: ComponentFixture<EdicionFabricaArticuloComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdicionFabricaArticuloComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdicionFabricaArticuloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
