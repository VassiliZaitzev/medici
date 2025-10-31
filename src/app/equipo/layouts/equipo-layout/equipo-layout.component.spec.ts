import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipoLayoutComponent } from './equipo-layout.component';

describe('EquipoLayoutComponent', () => {
  let component: EquipoLayoutComponent;
  let fixture: ComponentFixture<EquipoLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EquipoLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EquipoLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
