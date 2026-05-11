import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Atendimento } from './pages/atendimento/atendimento';
import { ListaDeDevedores } from './component/lista-de-devedores/lista-de-devedores';
import { HistoricoOrdemServico } from './component/historico-ordem-servico/historico-ordem-servico';
import { authGuard } from './guards/auth.guard';

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
      { path: 'historico', component: HistoricoOrdemServico },
    ],
  },

  { path: '**', redirectTo: 'atendimento' },
];
