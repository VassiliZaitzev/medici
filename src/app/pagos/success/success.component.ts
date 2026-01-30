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
  public estado: string = 'procesando'; 

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
        if (res.Estado === 'approved' || res.estado === 'approved') {
          
          this.estado = 'exito'; 
          localStorage.setItem('pago_status', 'approved');

          console.log('Pago confirmado. Esperando que el usuario presione volver.');
          
        } else {

          setTimeout(() => this.verificarPago(id), 3000);
        }
      },
      error: () => {
        setTimeout(() => this.verificarPago(id), 3000);
      },
    });
  }

  volverAlInicio() {
    this.router.navigate(['/chat']);
  }
}