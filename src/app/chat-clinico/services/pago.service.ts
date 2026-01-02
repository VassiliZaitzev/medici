import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private http = inject(HttpClient);

  crearPago() {
    return this.http.post<any>('http://localhost:5000/api/pagos/crear', {});
  }

  consultarEstado(paymentId: number) {
    return this.http.get(`http://localhost:5000/api/pagos/estado/${paymentId}`);
  }
}
