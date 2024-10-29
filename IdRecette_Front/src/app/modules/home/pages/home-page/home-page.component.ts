import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TITLE } from '../../../../utils/general';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ RouterLink ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  logoIdRecette: string = 'assets/images/logo.png';
  title: string = TITLE;
}
