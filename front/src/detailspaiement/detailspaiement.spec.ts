import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Detailspaiement } from './detailspaiement';

describe('Detailspaiement', () => {
  let component: Detailspaiement;
  let fixture: ComponentFixture<Detailspaiement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detailspaiement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Detailspaiement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
