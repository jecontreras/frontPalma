import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormConfigWebComponent } from './form-config-web.component';

describe('FormConfigWebComponent', () => {
  let component: FormConfigWebComponent;
  let fixture: ComponentFixture<FormConfigWebComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormConfigWebComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormConfigWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
