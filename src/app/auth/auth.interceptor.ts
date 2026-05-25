import { Injectable, inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { AUTH_CONFIG } from './auth.config';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);

  /** Controla se um refresh já está em andamento para evitar múltiplas chamadas */
  private isRefreshing = false;

  /**
   * Subject que emite o novo token após um refresh bem-sucedido.
   * Requisições que aguardam o refresh se inscrevem nele para serem reprocessadas.
   */
  private readonly refreshTokenSubject = new BehaviorSubject<string | null>(null);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (AUTH_CONFIG.AUTH_BYPASS_ENABLED) {
      return next.handle(req);
    }

    // Requisições para endpoints de autenticação passam sem modificação
    if (this.isAuthEndpoint(req.url)) {
      return next.handle(req.clone({ withCredentials: AUTH_CONFIG.WITH_CREDENTIALS }));
    }

    const token = this.authService.getToken();
    return next.handle(this.buildRequest(req, token)).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401(req, next);
        }
        return throwError(() => error);
      }),
    );
  }

  /**
   * Clona a requisição adicionando:
   * - withCredentials: true (necessário para cookies cross-origin)
   * - Authorization: Bearer <token> (quando disponível)
   * - X-XSRF-TOKEN (para requisições de mutação, lido do cookie XSRF-TOKEN)
   */
  private buildRequest(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
    let cloned = req.clone({ withCredentials: AUTH_CONFIG.WITH_CREDENTIALS });

    if (token) {
      cloned = cloned.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    const csrfToken = this.readCsrfFromCookie();
    if (csrfToken && this.isMutationMethod(req.method)) {
      cloned = cloned.clone({
        setHeaders: { [AUTH_CONFIG.CSRF_HEADER_NAME]: csrfToken },
      });
    }

    return cloned;
  }

  /**
   * Trata erros 401 (token expirado ou inválido).
   *
   * Fluxo:
   * 1. Se nenhum refresh está em curso → inicia um novo refresh.
   *    - Sucesso → repete a requisição original com o novo token.
   *    - Falha   → limpa a sessão e redireciona para login.
   * 2. Se um refresh já está em curso → aguarda o novo token e repete a requisição.
   */
  private handle401(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    if (!AUTH_CONFIG.REFRESH_TOKEN_ENDPOINT) {
      // Backend não suporta refresh → limpa sessão e redireciona
      this.authService.clearSession();
      this.authService.redirectToLogin();
      return throwError(() => new Error('Sessão expirada. Redirecionando para login.'));
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap(newToken => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(newToken);
          return next.handle(this.buildRequest(req, newToken));
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.authService.clearSession();
          this.authService.redirectToLogin();
          return throwError(() => err);
        }),
      );
    }

    // Refresh em andamento → aguarda o novo token e repete a requisição
    return this.refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap(newToken => next.handle(this.buildRequest(req, newToken))),
    );
  }

  private isAuthEndpoint(url: string): boolean {
    const endpoints: string[] = [
      AUTH_CONFIG.LOGIN_ENDPOINT,
      AUTH_CONFIG.LOGOUT_ENDPOINT,
      AUTH_CONFIG.REFRESH_TOKEN_ENDPOINT,
    ].filter(Boolean);
    return endpoints.some(ep => url.includes(ep));
  }

  private isMutationMethod(method: string): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  }

  /**
   * Lê o CSRF token do cookie não-HttpOnly enviado pelo backend (ex: XSRF-TOKEN).
   * Compatível com Spring Security e outros frameworks.
   */
  private readCsrfFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    const prefix = `${AUTH_CONFIG.CSRF_COOKIE_NAME}=`;
    for (const cookie of document.cookie.split(';')) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(prefix)) {
        return decodeURIComponent(trimmed.slice(prefix.length));
      }
    }
    return null;
  }
}