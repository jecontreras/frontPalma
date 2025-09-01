import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAdminPaquetesComponent } from './form-admin-paquetes.component';

describe('FormAdminPaquetesComponent', () => {
  let component: FormAdminPaquetesComponent;
  let fixture: ComponentFixture<FormAdminPaquetesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormAdminPaquetesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormAdminPaquetesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
