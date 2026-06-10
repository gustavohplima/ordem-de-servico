import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Atendimento } from './pages/atendimento/atendimento';
import { Historico } from './pages/historico/historico';
import { ListaDeDevedores } from './component/lista-de-devedores/lista-de-devedores';
import { authGuard } from './auth/auth.guard';
import { ComponenteDeTestes } from './component/componente-de-testes/componente-de-testes';

export const routes: Routes = [
  { path: '', redirectTo: 'atendimento', pathMatch: 'full' },

  // Rota pública — página de login
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
  },

  // Rotas privadas — protegidas pelo authGuard
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'atendimento', component: Atendimento },
      { path: 'home', component: Home },
      { path: 'devedores', component: ListaDeDevedores },
      { path: 'testes', component: ComponenteDeTestes },
      { path: 'historico', component: Historico },

    ],
  },

  { path: '**', redirectTo: 'atendimento' },
];
