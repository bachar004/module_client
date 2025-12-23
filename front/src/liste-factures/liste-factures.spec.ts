import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeFacturesComponent } from './liste-factures';

describe('ListeFacturesComponent', () => {
  let component: ListeFacturesComponent;
  let fixture: ComponentFixture<ListeFacturesComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeFacturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeFacturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
