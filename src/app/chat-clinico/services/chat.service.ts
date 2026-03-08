import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, OnInit } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from '../interfaces/chat.interface';
import { Examen } from '../interfaces/examen.interface';
import { ExamenFonasa } from '../interfaces/examen.fonasa.interface';
import { environment } from '../../../environments/environment'; 

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);
  public readonly chatKey: string;
  public urlBase: string = environment.apiUrl;

  constructor() {
    const savedKey = localStorage.getItem('chatgpt_key');
    if (savedKey) {
      this.chatKey = savedKey;
    } else {
      const newKey = uuidv4();
      localStorage.setItem('chatgpt_key', newKey);
      this.chatKey = newKey;
    }
  }

  sendMessage(message: string): Observable<any> {
    return this.http.get<any>(`${this.urlBase}/Chat/GptEnviarMensaje/${message}`).pipe(
      catchError(() => {
        return of(null);
      })
    );
  }

  sendBigMessage(message: string): Observable<any> {
    var mensaje = {
      "Mensaje": message
    }
    console.log("mensaje: "+ mensaje)
        return this.http.post<any>(`${this.urlBase}/Chat/GptEnviarBigMensaje`, mensaje).pipe(
      catchError(() => {
        return of(null);
      })
    );
  }

  listarChat(codigo: string): Observable<Chat[]> {
        return this.http
      .get<Chat[]>(`${this.urlBase}/Chat/ListarChat/${codigo}`)
      .pipe(
        catchError(() => {
          return of([]);
        })
      );
  }

  obtenerDocumento(): Observable<string> {
    return this.http.get<string>(`${this.urlBase}/Pdf/ObtenerDocumento`,{ responseType: 'text' as 'json' });
  }

  obtenerExamen(): Observable<Examen[]> {
    return this.http.get<Examen[]>(`${this.urlBase}/Examen/obtenerExamen`)
    .pipe(
      catchError(() => {
        return of([]);
      })
    );
  }

  obtenerExamenFonasa(): Observable<ExamenFonasa[]> {
    return this.http.get<ExamenFonasa[]>(`${this.urlBase}/Examen/obtenerExamenesFonasa`)
    .pipe(
      catchError(() => {
        return of([]);
      })
    );
  }
}