// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_API } from '../utils/general';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = URL_API + '/login';
  constructor(private readonly http: HttpClient) { }
  login(email: string, password: string): Observable<{ token: string }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = JSON.stringify({ username: email, password });
    return this.http.post<{ token: string }>(this.apiUrl, body, { headers });
  } 
}