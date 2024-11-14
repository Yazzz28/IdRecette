import { Component } from '@angular/core';
import { RecetteListComponent } from '@components/recette-list/recette-list.component';

@Component({
  selector: 'app-recette-list-page',
  standalone: true,
  imports: [ RecetteListComponent ],
  templateUrl: './recette-list-page.component.html',
  styleUrl: './recette-list-page.component.scss'
})
export class RecetteListPageComponent {

}
