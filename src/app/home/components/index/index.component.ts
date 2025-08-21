import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { HomeService } from '../../services/home.service';
import { Contact } from '../../interfaces/contact.interfaces';
import { Sexo } from '../../interfaces/sexo.interfaces';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  sexos: Sexo[] = [];
  contactForm: FormGroup;
  submitting = false;
  savedId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private homeService: HomeService
  ) {
this.contactForm = this.fb.group({
  nombre:    ['', [Validators.required, Validators.minLength(2)]],
  email:     ['', [Validators.required, Validators.email]],
  mensaje:   ['', [Validators.required, Validators.minLength(10)]],
  // ✅ sexo_corr opcional (sin Validators.required)
  sexo_corr: [null],
});

    // (Opcional) depuración:
    this.contactForm.statusChanges.subscribe(st => {
      console.log('Form status:', st, 'value:', this.contactForm.getRawValue());
    });
  }

  ngOnInit(): void {
    this.homeService.getSexos().subscribe({
      next: (list) => {
        this.sexos = list.filter(s => s.vigencia === 1);
        console.log('Sexos cargados:', this.sexos);
      },
      error: (err) => console.error('Error cargando sexos:', err)
    });
  }

  onSelectSexo(sexoCorr: number | null): void {
    // Si el usuario quiere deseleccionar, puedes pasar null
    this.contactForm.patchValue({ sexo_corr: sexoCorr });
    const ctrl = this.contactForm.get('sexo_corr');
    ctrl?.markAsDirty();
    ctrl?.markAsTouched();
    ctrl?.updateValueAndValidity();
    console.log('Sexo seleccionado:', sexoCorr);
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.savedId   = null;

    const payload: Contact = this.contactForm.getRawValue(); // incluirá sexo_corr si existe

    this.homeService.sendContact(payload).subscribe({
      next: (id) => {
        this.savedId = id;
        alert(`¡Consulta enviada! Tu código es ${id}`);
        this.contactForm.reset();
      },
      error: (err) => {
        console.error('Error al enviar consulta:', err);
        alert('Error al enviar, intenta más tarde.');
      },
      complete: () => this.submitting = false
    });
  }

  // Getters útiles
  get nombre() { return this.contactForm.get('nombre'); }
  get email() { return this.contactForm.get('email'); }
  get mensaje() { return this.contactForm.get('mensaje'); }
  get sexoCorrCtrl() { return this.contactForm.get('sexo_corr'); }
}
