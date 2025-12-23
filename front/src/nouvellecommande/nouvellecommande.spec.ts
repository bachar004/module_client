import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Nouvellecommande } from './nouvellecommande';

describe('Nouvellecommande', () => {
  let component: Nouvellecommande;
  let fixture: ComponentFixture<Nouvellecommande>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nouvellecommande]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Nouvellecommande);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});