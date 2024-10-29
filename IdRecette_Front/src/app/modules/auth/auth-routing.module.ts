import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralInfoComponent } from './components/general-info/general-info.component';
import { AllergyInfoComponent } from './components/allergy-info/allergy-info.component';
import { DietInfoComponent } from './components/diet-info/diet-info.component';
import { StepGuard } from './guards/step.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'general-info',
    pathMatch: 'full'
  },
  {
    path: 'general-info',
    component: GeneralInfoComponent
  },
  {
    path: 'allergies',
    component: AllergyInfoComponent,
    canActivate: [StepGuard],
    data: { requiredStep: 1 }
  },
  {
    path: 'diet',
    component: DietInfoComponent,
    canActivate: [StepGuard],
    data: { requiredStep: 2 }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }