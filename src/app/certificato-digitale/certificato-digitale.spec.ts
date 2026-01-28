import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificatoDigitale } from './certificato-digitale';

describe('CertificatoDigitale', () => {
  let component: CertificatoDigitale;
  let fixture: ComponentFixture<CertificatoDigitale>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificatoDigitale]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificatoDigitale);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
