import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { GeneralInfo, AllergyInfo, DietInfo, AuthState } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'your-api-url/auth';

  private readonly authStateSubject = new BehaviorSubject<AuthState>({
    currentStep: 1,
    isCompleted: false,
    generalInfo: undefined,
    allergyInfo: undefined,
    dietInfo: undefined
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    this.loadStateFromStorage();
  }

  // Méthodes de gestion d'état
  private loadStateFromStorage(): void {
    const savedState = localStorage.getItem('authState');
    if (savedState) {
      this.authStateSubject.next(JSON.parse(savedState));
    }
  }

  private updateState(newState: Partial<AuthState>): void {
    const currentState = this.authStateSubject.value;
    const updatedState = { ...currentState, ...newState };
    this.authStateSubject.next(updatedState);
    localStorage.setItem('authState', JSON.stringify(updatedState));
  }

  public getCurrentStep(): number {
    return this.authStateSubject.value.currentStep;
  }

  public resetState(): void {
    const initialState: AuthState = {
      currentStep: 1,
      isCompleted: false,
      generalInfo: undefined,
      allergyInfo: undefined,
      dietInfo: undefined
    };
    this.updateState(initialState);
    localStorage.removeItem('authState');
  }

  // Étape 1 : Informations générales
  public saveGeneralInfo(info: GeneralInfo): Observable<any> {
    return this.http.post(`${this.API_URL}/general-info`, info).pipe(
      tap(() => {
        this.updateState({
          generalInfo: info,
          currentStep: 2
        });
      }),
      catchError(this.handleError)
    );
  }

  // Étape 2 : Informations sur les allergies
  public saveAllergyInfo(info: AllergyInfo): Observable<any> {
    return this.http.post(`${this.API_URL}/allergy-info`, info).pipe(
      tap(() => {
        this.updateState({
          allergyInfo: info,
          currentStep: 3
        });
      }),
      catchError(this.handleError)
    );
  }

  // Étape 3 : Informations sur le régime alimentaire
  public saveDietInfo(info: DietInfo): Observable<any> {
    return this.http.post(`${this.API_URL}/diet-info`, info).pipe(
      tap(() => {
        this.updateState({
          dietInfo: info,
          currentStep: 3,
          isCompleted: true
        });
      }),
      catchError(this.handleError)
    );
  }

  // Méthode pour soumettre toutes les informations
  public submitCompleteProfile(): Observable<any> {
    const completeProfile = {
      ...this.authStateSubject.value.generalInfo,
      ...this.authStateSubject.value.allergyInfo,
      ...this.authStateSubject.value.dietInfo
    };

    return this.http.post(`${this.API_URL}/complete-profile`, completeProfile).pipe(
      tap(() => {
        this.updateState({ isCompleted: true });
      }),
      catchError(this.handleError)
    );
  }

  // Méthodes utilitaires
  public canAccessStep(step: number): boolean {
    return this.authStateSubject.value.currentStep >= step;
  }

  public isStepCompleted(step: number): boolean {
    const state = this.authStateSubject.value;
    switch (step) {
      case 1:
        return !!state.generalInfo;
      case 2:
        return !!state.allergyInfo;
      case 3:
        return !!state.dietInfo;
      default:
        return false;
    }
  }

  public getStepData<T>(step: number): T | undefined {
    const state = this.authStateSubject.value;
    switch (step) {
      case 1:
        return state.generalInfo as T;
      case 2:
        return state.allergyInfo as T;
      case 3:
        return state.dietInfo as T;
      default:
        return undefined;
    }
  }

  private handleError(error: any) {
    console.error('Une erreur est survenue:', error);
    return throwError(() => new Error('Une erreur est survenue lors de la communication avec le serveur'));
  }
}
