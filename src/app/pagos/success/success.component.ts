import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoService } from '../../chat-clinico/services/pago.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
})
export class SuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pagoService = inject(PagoService);

  public paymentId: string | null = '';
  public estado: string = 'procesando'; // 'procesando' | 'exito' | 'error'

  private intentos = 0;
  private maxIntentos = 5;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.paymentId = params['payment_id'];

      if (this.paymentId) {
        this.verificarPago(this.paymentId);
      } else {
        this.estado = 'error';
      }
    });
  }

  verificarPago(id: string) {
    this.pagoService.consultarEstado(Number(id)).subscribe({
      next: (res: any) => {
        // Validamos los dos estados posibles de éxito
        if (res.estado === 'approved' || res.estado === 'APROBADO') {
          this.estado = 'exito';
          localStorage.setItem('pago_status', 'approved');
          setTimeout(() => this.router.navigate(['/chat-clinico']), 3000);
        }
        // Si el backend dice que aún no llega el webhook
        else if (
          res.estado === 'pending_webhook' &&
          this.intentos < this.maxIntentos
        ) {
          this.intentos++;
          console.log(
            `Intento ${this.intentos}: Esperando notificación de Mercado Pago...`,
          );
          setTimeout(() => this.verificarPago(id), 3000); // Espera 3 segundos entre intentos
        } else {
          this.estado = 'error';
        }
      },
      error: (err) => {
        // Solo entra aquí si la API se cayó o no hay internet
        console.error('Error de conexión con el servidor');
        this.estado = 'error';
      },
    });
  }
}
