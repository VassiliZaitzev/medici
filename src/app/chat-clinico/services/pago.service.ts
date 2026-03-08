import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
// Importamos el archivo de variables de entorno
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Pago`;

  crearPago() {
    return this.http.post<any>(`${this.baseUrl}/crear`, {});
  }

  crearPagoConPdf(request: any) {
    return this.http.post<any>(`${this.baseUrl}/crear`, request);
  }

  consultarEstado(paymentId: number | string) {
    return this.http.get<any>(`${this.baseUrl}/estado/${paymentId}`);
  }

  // --- NUEVOS MÉTODOS AÑADIDOS ---

  descargarPdf(paymentId: number | string) {
    return this.http.get<{ base64: string }>(`${this.baseUrl}/descargar-pdf/${paymentId}`);
  }

  reenviarPdf(payload: { paymentId: number; email: string }) {
    return this.http.post<any>(`${this.baseUrl}/ReenviarPdf`, payload);
  }
}