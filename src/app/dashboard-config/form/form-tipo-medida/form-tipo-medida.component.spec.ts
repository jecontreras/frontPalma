import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTipoMedidaComponent } from './form-tipo-medida.component';

describe('FormTipoMedidaComponent', () => {
  let component: FormTipoMedidaComponent;
  let fixture: ComponentFixture<FormTipoMedidaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormTipoMedidaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTipoMedidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
