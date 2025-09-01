import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarGuiaComponent } from './actualizar-guia.component';

describe('ActualizarGuiaComponent', () => {
  let component: ActualizarGuiaComponent;
  let fixture: ComponentFixture<ActualizarGuiaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActualizarGuiaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualizarGuiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
