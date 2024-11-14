import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TITLE } from '@utils/general';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ RouterLink ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  logoIdRecette: string = 'assets/images/logo.png';
  title: string = TITLE;
}