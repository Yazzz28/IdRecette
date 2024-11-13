import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegexService {
  
  // Constante regex pour valider une adresse e-mail
  emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor() { }

  // Méthode pour vérifier si une chaîne est un email valide
  isValidEmail(email: string): boolean {
    return this.emailRegex.test(email);
  }
}