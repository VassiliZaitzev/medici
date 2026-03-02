import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
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
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      this.paymentId = params['payment_id'];

      if (!this.paymentId) {
        this.estado = 'error';
        return;
      }

      this.http
        .get<any>(`https://localhost:7172/api/Pago/estado/${this.paymentId}`)
        .subscribe({
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
          }
        });

    });
  }

  imprimirOrden() {
    const printArea = document.getElementById('print-area');
    if (!printArea) return;

    const original = document.body.innerHTML;
    document.body.innerHTML = printArea.innerHTML;

    window.print();

    document.body.innerHTML = original;
    window.location.reload(); // para recuperar Angular sin problemas
  }

  reenviarPdf() {
    this.mensajeReenvio = '';

    const email = (this.correoReenvio || '').trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      this.mensajeReenvioTipo = 'error';
      this.mensajeReenvio = 'El correo no tiene un formato válido.';
      return;
    }

    // Este base64 lo puedes guardar al momento de generar PDF en backend,
    // o puedes reenviar usando el chatGptKey / paymentId para que el backend regenere.
    // Aquí asumo que tu backend tiene un endpoint para reenviar por paymentId + email.
    this.reenviando = true;

    const payload = {
      paymentId: this.paymentId,
      email: email
    };

    this.http.post<any>('https://localhost:7172/api/Pdf/ReenviarPdf', payload)
      .subscribe({
        next: () => {
          this.mensajeReenvioTipo = 'ok';
          this.mensajeReenvio = '✅ PDF reenviado correctamente.';
          this.reenviando = false;
        },
        error: () => {
          this.mensajeReenvioTipo = 'error';
          this.mensajeReenvio = '❌ No se pudo reenviar el PDF. Intenta nuevamente.';
          this.reenviando = false;
        }
      });
  }

  volverAlInicio() {
    window.location.href = '/';
  }
}
