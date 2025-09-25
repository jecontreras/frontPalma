import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteSuscripcionesComponent } from './reporte-suscripciones.component';

describe('ReporteSuscripcionesComponent', () => {
  let component: ReporteSuscripcionesComponent;
  let fixture: ComponentFixture<ReporteSuscripcionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteSuscripcionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteSuscripcionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
