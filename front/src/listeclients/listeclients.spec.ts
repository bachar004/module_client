import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Listeclients } from './listeclients';

describe('Listeclients', () => {
  let component: Listeclients;
  let fixture: ComponentFixture<Listeclients>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listeclients]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Listeclients);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
