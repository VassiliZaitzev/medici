import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HomeService } from '../../../home/services/home.service';
import { Contact } from '../../../home/interfaces/contact.interfaces';


@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.scss']
})
export class ContactoComponent {
  contactForm: FormGroup;
  submitting = false;
  savedId: number | null = null;

  constructor(private fb: FormBuilder, private homeService: HomeService) {
    this.contactForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mensaje: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.savedId = null;

    const payload: Contact = this.contactForm.getRawValue();

    this.homeService.sendContact(payload).subscribe({
      next: (id) => {
        this.savedId = id;
        this.contactForm.reset();
      },
      error: (err) => {
        console.error('Error al enviar consulta:', err);
        alert('Error al enviar, intenta más tarde.');
      },
      complete: () => this.submitting = false
    });
  }

  // Getters para simplificar el template
  get nombre() { return this.contactForm.get('nombre'); }
  get email() { return this.contactForm.get('email'); }
  get mensaje() { return this.contactForm.get('mensaje'); }
}
