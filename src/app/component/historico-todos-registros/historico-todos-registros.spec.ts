import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoTodosRegistros } from './historico-todos-registros';

describe('HistoricoTodosRegistros', () => {
  let component: HistoricoTodosRegistros;
  let fixture: ComponentFixture<HistoricoTodosRegistros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoTodosRegistros],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricoTodosRegistros);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
