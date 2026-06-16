import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicosEntregues } from './servicos-entregues';

describe('ServicosEntregues', () => {
  let component: ServicosEntregues;
  let fixture: ComponentFixture<ServicosEntregues>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicosEntregues],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicosEntregues);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
