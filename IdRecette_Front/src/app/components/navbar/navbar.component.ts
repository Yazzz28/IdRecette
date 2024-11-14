import { Component, inject } from '@angular/core';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {

  // Methode provisoire pour la deconnection pendant la phase de developpement
  authService: AuthService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
