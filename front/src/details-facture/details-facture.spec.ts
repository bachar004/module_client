import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsFacture } from './details-facture';

describe('DetailsFacture', () => {
  let component: DetailsFacture;
  let fixture: ComponentFixture<DetailsFacture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsFacture]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsFacture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
