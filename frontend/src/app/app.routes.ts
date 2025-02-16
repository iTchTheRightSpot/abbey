import { Routes } from '@angular/router';

export const CoreRoutes = {
  HOME: '',
  AUTH: 'auth'
};

export const routes: Routes = [
  {
    path: CoreRoutes.HOME,
    loadComponent: () =>
      import('@home/home.component').then(m => m.HomeComponent)
  },
  {
    path: CoreRoutes.AUTH,
    loadComponent: () =>
      import('@auth/auth.component').then(m => m.AuthComponent)
  },
  { path: '**', redirectTo: `/${CoreRoutes.HOME}` }
];
