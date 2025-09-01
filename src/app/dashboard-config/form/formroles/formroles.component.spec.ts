import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormrolesComponent } from './formroles.component';

describe('FormrolesComponent', () => {
  let component: FormrolesComponent;
  let fixture: ComponentFixture<FormrolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormrolesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormrolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
