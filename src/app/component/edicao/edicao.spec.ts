import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Edicao } from './edicao';

describe('Edicao', () => {
  let component: Edicao;
  let fixture: ComponentFixture<Edicao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Edicao],
    }).compileComponents();

    fixture = TestBed.createComponent(Edicao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
