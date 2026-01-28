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
        // Verificamos si el pago fue aprobado
        if (res.Estado === 'approved' || res.estado === 'approved') {
          
          this.estado = 'exito'; // Esto muestra el HTML de éxito
          localStorage.setItem('pago_status', 'approved');

          // --- CAMBIO AQUÍ ---
          // Eliminamos el setTimeout que redirigía solo.
          // Ahora la pantalla se quedará quieta esperando al usuario.
          console.log('Pago confirmado. Esperando que el usuario presione volver.');
          
        } else {
          // Si no está aprobado aún, seguimos preguntando
          setTimeout(() => this.verificarPago(id), 3000);
        }
      },
      error: () => {
        // Si hay error de conexión (404), reintentamos
        setTimeout(() => this.verificarPago(id), 3000);
      },
    });
  }

  // Esta función se llamará SOLAMENTE cuando presiones el botón
  volverAlInicio() {
    this.router.navigate(['/chat-clinico']);
  }
}