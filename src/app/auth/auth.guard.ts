import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from './auth.service';
import { AUTH_CONFIG } from './auth.config';

/**
 * Guard que protege rotas privadas.
 *
 * Estratégia de verificação (duas etapas):
 * 1. Caminho rápido (síncrono) — verifica o token JWT no localStorage e sua expiração.
 *    Útil para autenticação baseada em token sem precisar aguardar o BehaviorSubject.
 * 2. Caminho via Observable — verifica o estado hidratado pelo APP_INITIALIZER,
 *    necessário para autenticação via cookie HttpOnly.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Passo 1: verifica token local de forma síncrona (sem chamada de rede)
  const token = authService.getToken();
  if (token && !authService.isTokenExpired(token)) {
    return true;
  }

  // Passo 2: verifica estado do BehaviorSubject (para autenticação via cookie)
  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) return true;
      return router.createUrlTree([AUTH_CONFIG.LOGIN_URL]);
    }),
  );
};
