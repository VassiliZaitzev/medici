import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PagoService } from '../../chat-clinico/services/pago.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
})
export class SuccessComponent implements OnInit {
  estado: string = 'procesando';
  paymentId: string = '';
  impresionVisible: boolean = false;
  orden: any;

  correoReenvio: string = '';
  reenviando: boolean = false;
  mensajeReenvio: string = '';
  mensajeReenvioTipo: 'ok' | 'error' = 'ok';

  constructor(
    private route: ActivatedRoute,
    private pagoService: PagoService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.paymentId = params['payment_id'];

      if (!this.paymentId) {
        this.estado = 'error';
        return;
      }

      // Usamos el servicio en lugar de this.http.get
      this.pagoService.consultarEstado(this.paymentId).subscribe({
        next: (res) => {
          const estadoPago = res.estado || res.Estado;

          if (estadoPago === 'approved') {
            this.estado = 'exito';

            const ordenStorage = localStorage.getItem('ordenMedica');
            if (ordenStorage) {
              this.orden = JSON.parse(ordenStorage);
              this.impresionVisible = true;

              // opcional: precargar email del paciente si existe
              this.correoReenvio = this.orden?.paciente?.email || '';
            }
          } else {
            this.estado = 'error';
          }
        },
        error: () => {
          this.estado = 'error';
        },
      });
    });
  }

  imprimirOrden() {
    this.estado = 'procesando';

    // Usamos el servicio en lugar de this.http.get
    this.pagoService.descargarPdf(this.paymentId).subscribe({
      next: (res) => {
        this.estado = 'exito'; // Quita el loader

        // Transformar el string Base64 a un archivo PDF (Blob)
        const byteCharacters = atob(res.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(blob);

        // Abrir el PDF mágico en una nueva pestaña
        window.open(fileURL, '_blank');
      },
      error: () => {
        this.estado = 'exito';
        alert(
          'El PDF aún se está generando o no se encontró. Espera un momento y vuelve a intentar.'
        );
      },
    });
  }

  reenviarPdf() {
    this.mensajeReenvio = '';

    const email = (this.correoReenvio || '').trim().toLowerCase();

    // 1. Validar que no esté vacío
    if (email === '') {
      this.mensajeReenvioTipo = 'error';
      this.mensajeReenvio = '⚠️ Por favor, ingresa un correo electrónico.';
      return;
    }

    // 2. Validar que tenga formato de correo real
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      this.mensajeReenvioTipo = 'error';
      this.mensajeReenvio =
        '❌ El correo no tiene un formato válido (ej: usuario@gmail.com).';
      return;
    }

    this.reenviando = true;

    const payload = {
      paymentId: Number(this.paymentId),
      email: email,
    };

    // Usamos el servicio en lugar de this.http.post
    this.pagoService.reenviarPdf(payload).subscribe({
      next: () => {
        this.mensajeReenvioTipo = 'ok';
        this.mensajeReenvio = '✅ PDF reenviado correctamente.';
        this.reenviando = false;
      },
      error: (err) => {
        console.error('Error al reenviar:', err);
        this.mensajeReenvioTipo = 'error';
        this.mensajeReenvio =
          '❌ No se pudo reenviar el PDF. Intenta nuevamente.';
        this.reenviando = false;
      },
    });
  }

  volverAlInicio() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }
}