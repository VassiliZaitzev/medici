// src/app/home/services/home.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Contact } from '../interfaces/contact.interfaces';
import { Sexo } from '../interfaces/sexo.interfaces';

// 1. Importamos tu archivo maestro de entornos
import { environment } from '../../../environments/environment';

interface ContactResponse {
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private readonly API_BASE = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendContact(contact: Contact): Observable<number> {
    return this.http
      .post<ContactResponse>(
        `${this.API_BASE}/contact/AgregarContacto`,
        contact
      )
      .pipe(map(res => res.id));
  }

  getSexos(): Observable<Sexo[]> {
    return this.http.get<Sexo[]>(`${this.API_BASE}/sexo`);
  }
}