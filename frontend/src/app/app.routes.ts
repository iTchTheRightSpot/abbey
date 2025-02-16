import { Routes } from '@angular/router';

export const RootRoutes = {
  HOME: '',
  AUTH: 'auth'
};

export const routes: Routes = [
  {
    path: RootRoutes.HOME,
    loadComponent: () =>
      import('@home/home.component').then(m => m.HomeComponent),
    loadChildren: () => import('@home/home.routes').then(m => m.routes)
  },
  {
    path: RootRoutes.AUTH,
    loadComponent: () =>
      import('@auth/auth.component').then(m => m.AuthComponent)
  },
  { path: '**', redirectTo: `/${RootRoutes.HOME}` }
];
