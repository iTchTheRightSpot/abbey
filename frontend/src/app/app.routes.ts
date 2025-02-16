import { Routes } from '@angular/router';

export const CoreRoutes = {
  HOME: 'home',
  AUTH: 'auth'
};

export const routes: Routes = [
  {
    path: CoreRoutes.HOME,
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: CoreRoutes.AUTH,
    loadComponent: () =>
      import('./pages/auth/auth.component').then(m => m.AuthComponent)
  },
  { path: '**', redirectTo: `/${CoreRoutes.HOME}` }
];
