import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AUTH_CONFIG } from '../auth/auth.config';
import { AuthUser, LoginRequest, LoginResponse, TokenPayload } from '../model/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _currentUser$ = new BehaviorSubject<AuthUser | null>(null);

  /** Observable do usuário autenticado. Emite `null` quando não autenticado. */
  readonly currentUser$: Observable<AuthUser | null> = this._currentUser$.asObservable();

  /** Observable do estado booleano de autenticação */
  readonly isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(
    map(user => user !== null),
  );

  // ── Login / Logout ────────────────────────────────────────────────────────

  login(credentials: LoginRequest): Observable<void> {
    const url = `${AUTH_CONFIG.API_URL}${AUTH_CONFIG.LOGIN_ENDPOINT}`;
    return this.http
      .post<LoginResponse>(url, credentials, {
        withCredentials: AUTH_CONFIG.WITH_CREDENTIALS,
      })
      .pipe(
        switchMap(response => {
          const accessToken = this.extractAccessToken(response);
          const refreshToken = this.extractRefreshToken(response);
          if (accessToken) this.saveToken(accessToken);
          if (refreshToken) this.saveRefreshToken(refreshToken);

          const userFromToken = this.extractUserFromToken(accessToken);
          if (userFromToken) {
            this._currentUser$.next(userFromToken);
            return of(void 0);
          }

          const fallbackUser: AuthUser = {
            nome: credentials.nome,
            roles: [],
          };
          this._currentUser$.next(fallbackUser);

          // Fluxo cookie-only: autentica no servidor, mas sem retornar access token no corpo.
          // Nesse caso, hidrata o estado com /me para que o guard libere o acesso.
          if (AUTH_CONFIG.CHECK_AUTH_ENDPOINT) {
            return this.checkAuth().pipe(
              tap(() => {
                // Se /me falhar (ex.: 403) mantendo currentUser null, preserva fallback para navegação.
                if (!this._currentUser$.value) {
                  this._currentUser$.next(fallbackUser);
                }
              }),
            );
          }

          return of(void 0);
        }),
      );
  }

  /**
   * Realiza logout chamando o backend para que o servidor invalide o cookie HttpOnly.
   * A limpeza local ocorre independentemente do resultado do backend.
   */
  logout(): Observable<void> {
    const url = `${AUTH_CONFIG.API_URL}${AUTH_CONFIG.LOGOUT_ENDPOINT}`;
    return this.http
      .post<void>(url, {}, { withCredentials: AUTH_CONFIG.WITH_CREDENTIALS })
      .pipe(
        catchError(() => of(void 0)),
        tap(() => this.clearSession()),
      );
  }

  /**
   * Verifica autenticação no backend (necessário para cookies HttpOnly).
   * Chamado via APP_INITIALIZER para hidratar o estado antes da renderização.
   */
  checkAuth(): Observable<void> {
    if (!AUTH_CONFIG.CHECK_AUTH_ENDPOINT) return of(void 0);

    // Caminho rápido: token local válido evita chamada de rede
    const localToken = this.getToken();
    if (localToken && !this.isTokenExpired(localToken)) {
      this._currentUser$.next(this.extractUserFromToken(localToken));
      return of(void 0);
    }

    const url = `${AUTH_CONFIG.API_URL}${AUTH_CONFIG.CHECK_AUTH_ENDPOINT}`;
    return this.http
      .get<AuthUser>(url, { withCredentials: AUTH_CONFIG.WITH_CREDENTIALS })
      .pipe(
        tap(user => this._currentUser$.next(user)),
        map(() => void 0),
        catchError(() => {
          this.clearSession();
          return of(void 0);
        }),
      );
  }

  // ── Refresh Token ─────────────────────────────────────────────────────────

  /**
   * Solicita um novo access token usando o refresh token armazenado.
   * Retorna o novo access token como string.
   */
  refreshToken(): Observable<string> {
    const url = `${AUTH_CONFIG.API_URL}${AUTH_CONFIG.REFRESH_TOKEN_ENDPOINT}`;
    const storedRefreshToken = this.getRefreshToken();
    return this.http
      .post<LoginResponse>(
        url,
        { refreshToken: storedRefreshToken },
        { withCredentials: AUTH_CONFIG.WITH_CREDENTIALS },
      )
      .pipe(
        tap(response => {
          const accessToken = this.extractAccessToken(response);
          if (accessToken) {
            this.saveToken(accessToken);
            this._currentUser$.next(this.extractUserFromToken(accessToken));
          }
          const newRefresh = this.extractRefreshToken(response);
          if (newRefresh) this.saveRefreshToken(newRefresh);
        }),
        map(response => this.extractAccessToken(response) ?? ''),
      );
  }

  // ── Armazenamento de Token ────────────────────────────────────────────────

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
  }

  private saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, token);
    }
  }

  getRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  }

  private saveRefreshToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, token);
    }
  }

  /** Remove tokens locais e reseta o estado do usuário */
  clearSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    }
    this._currentUser$.next(null);
  }

  // ── Decodificação do JWT ──────────────────────────────────────────────────

  /**
   * Decodifica o payload do JWT sem verificar a assinatura.
   * Use apenas para extrair informações de UI (nome, roles).
   * A validação real ocorre no backend.
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      // Converte Base64Url para Base64 padrão e aplica padding
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      return JSON.parse(atob(padded)) as TokenPayload;
    } catch {
      return null;
    }
  }

  /** Verifica se o token está expirado com base na claim `exp` */
  isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload?.exp) return true;
    return Date.now() >= payload.exp * 1000;
  }

  private extractUserFromToken(token: string | null | undefined): AuthUser | null {
    if (!token) return null;
    const payload = this.decodeToken(token);
    if (!payload) return null;
    return {
      nome: payload.sub ?? '',
      name: payload.name,
      email: payload.email,
      roles: Array.isArray(payload.roles) ? (payload.roles as string[]) : [],
    };
  }

  private extractAccessToken(response: LoginResponse): string | null {
    const raw = response as unknown as Record<string, unknown>;
    const configured = this.asString(raw[AUTH_CONFIG.TOKEN_RESPONSE_FIELD]);
    if (configured) return configured;

    return this.asString(raw['token']) ?? this.asString(raw['jwt']) ?? this.asString(raw['access_token']);
  }

  private extractRefreshToken(response: LoginResponse): string | null {
    const raw = response as unknown as Record<string, unknown>;
    const configured = this.asString(raw[AUTH_CONFIG.REFRESH_TOKEN_RESPONSE_FIELD]);
    if (configured) return configured;

    return this.asString(raw['refresh_token']);
  }

  private asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }

  // ── Navegação ─────────────────────────────────────────────────────────────

  redirectToLogin(): Promise<boolean> {
    return this.router.navigate([AUTH_CONFIG.LOGIN_URL]);
  }

  redirectAfterLogin(): Promise<boolean> {
    return this.router.navigate([AUTH_CONFIG.POST_LOGIN_REDIRECT]);
  }
}
