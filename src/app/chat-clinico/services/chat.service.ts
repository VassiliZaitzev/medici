import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, OnInit } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from '../interfaces/chat.interface';
import { Examen } from '../interfaces/examen.interface';
import { ExamenFonasa } from '../interfaces/examen.fonasa.interface';

@Injectable({
  providedIn: 'root',
})
export class ChatService {

  private apiKey2= '';
  private apiKey = '';
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private http = inject(HttpClient);

  public readonly chatKey: string;

  public urlBase: string = 'https://localhost:7172/api';

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
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    });

    const body = {
      model: 'gpt-4o-mini', // Puedes cambiar esto según necesidad
      messages: [{ role: 'user', content: message }],
      max_tokens: 1000,
    };

    return this.http.post(this.apiUrl, body, { headers });
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
    return this.http.get<string>('https://localhost:7172/api/Pdf/ObtenerDocumento',{ responseType: 'text' as 'json' });
  }

  /*obtenerDocumento(): Observable<string> {
    return this.http.get<string>(`${this.urlBase}/Pdf/ObtenerDocumento`).pipe(
      catchError(() => {
        return of('');
      })
    );
  }*/



  obtenerExamen(): Observable<Examen[]> {
    return this.http.get<Examen[]>('https://localhost:7172/api/Examen/obtenerExamen')
    .pipe(
      catchError(() => {
        return of([]);
      })
    );
  }


  obtenerExamenFonasa(): Observable<ExamenFonasa[]> {
    return this.http.get<ExamenFonasa[]>('https://localhost:7172/api/Examen/obtenerExamenesFonasa')
    .pipe(
      catchError(() => {
        return of([]);
      })
    );
  }
}
