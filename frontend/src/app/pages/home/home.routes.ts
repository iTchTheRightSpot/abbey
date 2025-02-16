import { Routes } from '@angular/router';

export const HomeRoutes = {
  ACCOUNT: 'account',
  SOCIAL: 'social'
};

export const routes: Routes = [
  {
    path: HomeRoutes.ACCOUNT,
    loadComponent: () =>
      import('@home/pages/account/account.component').then(
        m => m.AccountComponent
      )
  },
  {
    path: HomeRoutes.SOCIAL,
    loadComponent: () =>
      import('@home/pages/social/social.component').then(m => m.SocialComponent)
  }
];
