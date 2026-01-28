import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private http = inject(HttpClient);

  crearPago() {
    return this.http.post<any>('https://localhost:7172/api/Pago/crear', {});
  }

  consultarEstado(paymentId: number) {
    return this.http.get(`https://localhost:7172/api/Pago/estado/${paymentId}`);
  }
}
