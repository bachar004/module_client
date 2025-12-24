import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Listepaiements } from './listepaiements';

describe('Listepaiements', () => {
  let component: Listepaiements;
  let fixture: ComponentFixture<Listepaiements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listepaiements]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Listepaiements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
