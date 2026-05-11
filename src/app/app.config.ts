import {
  APP_INITIALIZER,
  ApplicationConfig,
  PLATFORM_ID,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { isPlatformBrowser } from '@angular/common';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HttpErrorInterceptor } from './services/http-error.interceptor';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideToastr(),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),

    // Interceptor genérico de erros HTTP (externo — processa a resposta por último)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },

    // Interceptor de autenticação (interno — mais próximo do backend)
    // Injeta o token JWT, trata 401 com refresh e gerencia CSRF
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },

    // Hidrata o estado de autenticação antes da primeira renderização.
    // Necessário para autenticação via cookie HttpOnly (estado "cego").
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const authService = inject(AuthService);
        const platformId = inject(PLATFORM_ID);
        return (): Promise<void> => {
          if (!isPlatformBrowser(platformId)) return Promise.resolve();
          return new Promise<void>(resolve => {
            authService.checkAuth().subscribe({
              complete: () => resolve(),
              error: () => resolve(),
            });
          });
        };
      },
      multi: true,
    },
  ],
};
