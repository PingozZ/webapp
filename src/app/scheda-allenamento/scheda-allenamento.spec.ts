import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedaAllenamento } from './scheda-allenamento';

describe('SchedaAllenamento', () => {
  let component: SchedaAllenamento;
  let fixture: ComponentFixture<SchedaAllenamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedaAllenamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedaAllenamento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
