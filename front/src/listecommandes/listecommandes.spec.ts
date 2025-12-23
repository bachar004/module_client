import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Listecommandes } from './listecommandes';

describe('Listecommandes', () => {
  let component: Listecommandes;
  let fixture: ComponentFixture<Listecommandes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listecommandes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Listecommandes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});