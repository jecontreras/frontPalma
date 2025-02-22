import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPagoComponent } from './dialog-pago.component';

describe('DialogPagoComponent', () => {
  let component: DialogPagoComponent;
  let fixture: ComponentFixture<DialogPagoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogPagoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
