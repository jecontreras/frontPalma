import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TallajeComponent } from './tallaje.component';

describe('TallajeComponent', () => {
  let component: TallajeComponent;
  let fixture: ComponentFixture<TallajeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TallajeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TallajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
