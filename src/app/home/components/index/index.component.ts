// src/app/home/components/index/index.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
      nombre:    ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      mensaje:   ['', Validators.required],
      sexo_corr: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.homeService.getSexos().subscribe({
      next: (list) => this.sexos = list.filter(s => s.vigencia === 1,console.log('Sexos cargados:', this.sexos),) ,
      error: (err) => console.error('Error cargando sexos:', err)
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.savedId   = null;
    const payload: Contact = this.contactForm.value;

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
    onSelectSexo(sexoCorr: number) {
    console.log('Sexo seleccionado:', sexoCorr);
    // más adelante aquí llamaremos al servicio de exámenes…
  }
}
