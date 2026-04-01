import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PagoService } from '../../chat-clinico/services/pago.service';

// 🔥 1. Importamos la constante 'demo' desde tu archivo de entorno
// (Ajusta la cantidad de puntos '../' si tu archivo environment está en otra ruta)
import { demo } from '../../../environments/environment';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
})
export class SuccessComponent implements OnInit {
  estado: string = 'procesando';
  paymentId: string = '';
  
  // Variable nueva para el Modo Demo
  externalReference: string = ''; 
  
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
      // Tomamos el ID del pago
      this.paymentId = params['payment_id'] || params['collection_id'];

      // Capturamos la referencia externa de MercadoPago para el Modo Demo
      this.externalReference = params['external_reference'] || params['ref'];

      // Tomamos el estado directamente de la URL
      const estadoEnUrl = params['status'] || params['collection_status'];

      if (!this.paymentId) {
        this.estado = 'error';
        return;
      }

      // Si la URL dice 'approved', mostramos éxito inmediato.
      if (estadoEnUrl === 'approved') {
        this.marcarComoExito();
      } else {
        // Plan B: consultamos al backend
        this.pagoService.consultarEstado(this.paymentId).subscribe({
          next: (res) => {
            const estadoPago = res.estado || res.Estado;
            if (estadoPago === 'approved') {
              this.marcarComoExito();
            } else {
              this.estado = 'error';
            }
          },
          error: () => {
            this.estado = 'error';
          },
        });
      }
    });
  }

  // Método auxiliar para no repetir código
  marcarComoExito() {
    this.estado = 'exito'; 

    const ordenStorage = localStorage.getItem('ordenMedica');
    if (ordenStorage) {
      this.orden = JSON.parse(ordenStorage);
      this.impresionVisible = true;
      this.correoReenvio = this.orden?.paciente?.email || '';
    }
  }

  imprimirOrden() {
    this.estado = 'procesando';

    // 🔥 2. LA MAGIA: Armamos la URL dinámicamente según el entorno
    let urlConParametros = `${this.paymentId}`;

    // Si tu constante demo dice que es true, le pasamos la llave al backend
    if (demo.isDemoMode) {
      urlConParametros += `?chatKey=${this.externalReference}`;
    }

    // Le pasamos la URL modificada al servicio
    this.pagoService.descargarPdf(urlConParametros).subscribe({
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

    // Validar que no esté vacío
    if (email === '') {
      this.mensajeReenvioTipo = 'error';
      this.mensajeReenvio = '⚠️ Por favor, ingresa un correo electrónico.';
      return;
    }

    // Validar que tenga formato de correo real
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