import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { URL_API } from '@utils/general';

@Injectable({
  providedIn: 'root',
})
export class DietService {
  http: HttpClient = inject(HttpClient);

  getAllDiets(): Observable<any> {
    return this.http.get(`${URL_API}/diets`).pipe(
      map((response: any) => {
        // Check if 'member' exists and is an array
        if (response.member && Array.isArray(response.member)) {
          // Extract and return diet names from the 'member' array
          return response.member.map((diet: any) => ({
            id: diet.id,
            name: diet.name,
          }));
        } else {
          console.error('Expected "member" array but received:', response);
          return [];
        }
      })
    );
  }

  getAllergyList(): Observable<any> {
    return this.http.get(`${URL_API}/categories?isAllergen=true`).pipe(
      map((response: any) => {
        // Check if 'member' exists and is an array
        if (response.member && Array.isArray(response.member)) {
          // Extract and return allergy names from the 'member' array
          return response.member.map((allergy: any) => ({
            id: allergy.id,
            name: allergy.name,
          }));
        } else {
          console.error('Expected "member" array but received:', response);
          return [];
        }
      })
    );
  }
}  