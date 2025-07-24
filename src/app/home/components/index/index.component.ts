// src/app/home/components/index/index.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HomeService } from '../../services/home.service';
import { Contact } from '../../interfaces/contact.interfaces';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent {
  contactForm: FormGroup;
  submitting = false;
  savedId: number | null = null;    // ← Aquí guardamos el ID devuelto

  constructor(
    private fb: FormBuilder,
    private homeService: HomeService
  ) {
    this.contactForm = this.fb.group({
      nombre:  ['', Validators.required],
      email:   ['', [Validators.required, Validators.email]],
      mensaje: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.savedId = null;

    const payload: Contact = this.contactForm.value;

    this.homeService.sendContact(payload).subscribe({
      next: (id: number) => {
        this.savedId = id;
        alert(`¡Consulta enviada! Tu código es ${id}`);
        this.contactForm.reset();
      },
      error: (err) => {
        console.error(err);
        alert('Error al enviar, intenta más tarde.');
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }
}
