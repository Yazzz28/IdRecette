import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_API } from '@utils/general';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {

  constructor(private readonly http: HttpClient) { }

  getRecipesLimited(menuCount: number): Observable<any> {
    return this.http.get(`${URL_API}/recipes?_limit=${menuCount}`);
  }
}
