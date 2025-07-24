// src/app/home/services/home.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Contact } from '../interfaces/contact.interfaces';

interface ContactResponse {
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private readonly API = 'https://localhost:7172/api/contact';

  constructor(private http: HttpClient) {}

  sendContact(contact: Contact): Observable<number> {
    return this.http
      .post<ContactResponse>(`${this.API}/AgregarContacto`, contact)
      .pipe(map(response => response.id));
  }
}
