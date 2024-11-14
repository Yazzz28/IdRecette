import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home-page/home-page.component').then(m => m.HomePageComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login-page/login-page.component').then(m => m.LoginPageComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register-page/register-page.component').then(m => m.RegisterPageComponent),
  },
  {
    path: 'form',
    loadComponent: () => import('./pages/form-page/form-page.component').then(m => m.FormPageComponent),
  },
  {
    path: 'recettes',
    loadComponent: () => import('./pages/recette-list-page/recette-list-page.component').then(m => m.RecetteListPageComponent),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];