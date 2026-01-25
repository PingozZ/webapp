import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaUpdateComponent } from './pagina-update';


describe('PaginaUpdate', () => {
  let component: PaginaUpdateComponent;
  let fixture: ComponentFixture<PaginaUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaUpdateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
