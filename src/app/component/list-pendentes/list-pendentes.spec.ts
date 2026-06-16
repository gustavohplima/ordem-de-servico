import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPendentes } from './list-pendentes';

describe('ListPendentes', () => {
  let component: ListPendentes;
  let fixture: ComponentFixture<ListPendentes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPendentes],
    }).compileComponents();

    fixture = TestBed.createComponent(ListPendentes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
