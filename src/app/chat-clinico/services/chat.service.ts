import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiKey = 'asd'; // Poner tu API Key aquí
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private http = inject(HttpClient);

  sendMessage(message: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    });

    const body = {
      model: 'gpt-4o-mini', // O el modelo que uses
      messages: [{ role: 'user', content: message }],
      max_tokens: 150,
    };

    return this.http.post(this.apiUrl, body, { headers });
  }
}
