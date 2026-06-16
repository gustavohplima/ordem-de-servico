import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormModel } from './form-model';

describe('FormModel', () => {
  let component: FormModel;
  let fixture: ComponentFixture<FormModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormModel],
    }).compileComponents();

    fixture = TestBed.createComponent(FormModel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
