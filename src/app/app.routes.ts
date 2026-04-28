import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'winners',
    loadComponent: () =>
      import('./pages/winners/winners.page').then((m) => m.WinnersPage),
  },
  {
    path: 'generate-ticket',
    loadComponent: () =>
      import('./pages/generate-ticket/generate-ticket.page').then(
        (m) => m.GenerateTicketPage
      ),
  },
  {
    path: 'ticket-preview',
    loadComponent: () =>
      import('./pages/ticket-preview/ticket-preview.page').then(
        (m) => m.TicketPreviewPage
      ),
  },
  {
    path: 'verify-ticket',
    loadComponent: () =>
      import('./pages/verify-ticket/verify-ticket.page').then(
        (m) => m.VerifyTicketPage
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.page').then((m) => m.SettingsPage),
  },
];
