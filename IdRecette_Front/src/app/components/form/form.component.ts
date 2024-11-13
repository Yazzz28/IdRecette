import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ NavbarComponent, CommonModule, FormsModule ], // Correction des imports
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'] // Correction de 'styleUrl' en 'styleUrls'
})
export class FormComponent {
  menuCount = 5; // Valeur initiale

  increment() {
      this.menuCount++;
  }

  decrement() {
      if (this.menuCount > 0) {
          this.menuCount--;
      }
  }
}
