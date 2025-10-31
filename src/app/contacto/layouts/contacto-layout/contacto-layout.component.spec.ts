import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactoLayoutComponent } from './contacto-layout.component';

describe('ContactoLayoutComponent', () => {
  let component: ContactoLayoutComponent;
  let fixture: ComponentFixture<ContactoLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactoLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactoLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
