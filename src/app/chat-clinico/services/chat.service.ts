import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiKey = '';

  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private http = inject(HttpClient);

  public readonly chatKey: string;

  constructor() {
    console.log('ChatService inicializado');

    const savedKey = localStorage.getItem('chatgpt_key');
    if (savedKey) {
      this.chatKey = savedKey;
    } else {
      const newKey = uuidv4();
      localStorage.setItem('chatgpt_key', newKey);
      this.chatKey = newKey;
    }

    console.log('chatgpt_key:', this.chatKey);
  }

  sendMessage(message: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    });

    const body = {
      model: 'gpt-4o-mini', // Puedes cambiar esto según necesidad
      messages: [{ role: 'user', content: message }],
      max_tokens: 150,
    };

    return this.http.post(this.apiUrl, body, { headers });
  }
}
