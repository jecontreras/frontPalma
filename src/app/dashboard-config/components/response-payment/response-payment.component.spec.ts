import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsePaymentComponent } from './response-payment.component';

describe('ResponsePaymentComponent', () => {
  let component: ResponsePaymentComponent;
  let fixture: ComponentFixture<ResponsePaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResponsePaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
