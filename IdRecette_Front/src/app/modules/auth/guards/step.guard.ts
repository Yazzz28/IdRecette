import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class StepGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredStep = route.data['requiredStep'];
    const currentStep = this.authService?.getCurrentStep();

    if (currentStep >= requiredStep) {
      return true;
    }

    this.router.navigate(['/auth/general-info']);
    return false;
  }
}