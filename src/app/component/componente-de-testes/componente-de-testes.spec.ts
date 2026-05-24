import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponenteDeTestes } from './componente-de-testes';

describe('ComponenteDeTestes', () => {
  let component: ComponenteDeTestes;
  let fixture: ComponentFixture<ComponenteDeTestes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponenteDeTestes],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponenteDeTestes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
