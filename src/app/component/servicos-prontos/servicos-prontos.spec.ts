import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicosProntos } from './servicos-prontos';

describe('ServicosProntos', () => {
  let component: ServicosProntos;
  let fixture: ComponentFixture<ServicosProntos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicosProntos],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicosProntos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
