import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListModel } from './list-model';

describe('ListModel', () => {
  let component: ListModel;
  let fixture: ComponentFixture<ListModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListModel],
    }).compileComponents();

    fixture = TestBed.createComponent(ListModel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
