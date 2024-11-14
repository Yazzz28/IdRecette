import { Component } from '@angular/core';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { RecipesService } from '@services/recipes.service';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ NavbarComponent, CommonModule, FormsModule, ReactiveFormsModule ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent {

  recipeForm: FormGroup;
  menuCount = 5; // Initial value

  constructor(
private readonly recipesService: RecipesService
  ) {
    this.recipeForm = new FormGroup({
      menuCount: new FormControl(this.menuCount, [Validators.required, Validators.min(1)])
    });
  }

  increment() {
      this.menuCount++;
      this.recipeForm.controls['menuCount'].setValue(this.menuCount);
  }

  decrement() {
      if (this.menuCount > 0) {
          this.menuCount--;
          this.recipeForm.controls['menuCount'].setValue(this.menuCount);
      }
  }

  onSubmit() {
    if (this.recipeForm.valid) {
      this.recipesService.getRecipesLimited(this.recipeForm.value.menuCount);
    } else {
      console.log('Form is invalid');
    }
  }
}
