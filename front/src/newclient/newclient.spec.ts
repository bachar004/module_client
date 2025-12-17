import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Newclient } from './newclient';

describe('Newclient', () => {
  let component: Newclient;
  let fixture: ComponentFixture<Newclient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Newclient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Newclient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
