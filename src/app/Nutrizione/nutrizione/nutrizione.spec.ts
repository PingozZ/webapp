import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Nutrizione } from './nutrizione';

describe('Nutrizione', () => {
  let component: Nutrizione;
  let fixture: ComponentFixture<Nutrizione>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nutrizione]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Nutrizione);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
