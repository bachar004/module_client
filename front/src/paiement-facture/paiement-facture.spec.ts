import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaiementFacture } from './paiement-facture';

describe('PaiementFacture', () => {
  let component: PaiementFacture;
  let fixture: ComponentFixture<PaiementFacture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaiementFacture]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaiementFacture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
