import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { CommonModule, AsyncPipe } from '@angular/common';
import { User } from '@models/user.model';
import { RegexService } from '@services/regex.service';
import { Router, RouterLink } from '@angular/router';
import { DietService } from '@services/diet.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AsyncPipe, RouterLink],
})
export class RegisterComponent {
  registerForm: FormGroup;
  router: Router = inject(Router);
  allergies: Observable<any>;
  diets: Observable<any>;
  isAllergySectionVisible = false; 

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly regexService: RegexService,
    private readonly dietService: DietService
  ) {
    this.diets = this.dietService.getAllDiets();
    this.allergies = this.dietService.getAllergyList();
    this.registerForm = this.fb.group({
      email: [
        '',
        [Validators.required, Validators.pattern(this.regexService.emailRegex)],
      ],
      pseudo: ['', Validators.required],
      passwords: this.fb.group(
        {
          password: [
            '',
            [
              Validators.required,
              Validators.minLength(8),
              this.authService.securePasswordValidator(),
            ],
          ],
          confirmPassword: ['', Validators.required],
        },
        { validators: this.authService.passwordMatchValidator() }
      ),
      allergy: this.fb.array([]),
      diet: [''],
    });
  }

  onSubmit() {
    // Vérifier si le formulaire est valide avant de soumettre
    if (this.registerForm.valid) {
      console.log(this.registerForm.value);
      // Destructurer la valeur du formulaire pour obtenir les données de l'utilisateur,
      // excluant confirmPassword et passwords.
      const { passwords, confirmPassword, ...userData } =
        this.registerForm.value;

      // Récupérer la valeur du mot de passe, qui est dans le groupe passwords.
      const user: User = {
        ...userData,
        password: passwords.password, // Récupérer directement le mot de passe depuis le groupe passwords.
        allergy: this.registerForm.get('allergy')?.value,
        diet: this.registerForm.get('diet')?.value,
      };

      // Appeler la méthode d'enregistrement depuis le service d'authentification
      this.authService.register(user).subscribe({
        next: (response: any) => {
          console.log(user);
          console.log(response);
          localStorage.setItem('token', response.token);
          this.router.navigate(['/']);
        },
        error: (error: any) => {
          console.error(error);
        },
      });
    }
  }

  isAllergySelected(allergy: string): boolean {
    const allergyFormArray = this.registerForm.get('allergy') as FormArray;
    return allergyFormArray.controls.some(
      (control) => control.value === allergy
    );
  }

  onAllergyChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const allergy = checkbox.value;
    const allergyFormArray = this.registerForm.get('allergy') as FormArray;

    if (checkbox.checked) {
      allergyFormArray.push(this.fb.control(allergy));
    } else {
      const index = allergyFormArray.controls.findIndex(
        (control) => control.value === allergy
      );
      if (index !== -1) {
        allergyFormArray.removeAt(index);
      }
    }
  }

  toggleAllergySection() {
    this.isAllergySectionVisible = !this.isAllergySectionVisible;
  }
}
