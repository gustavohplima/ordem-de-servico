import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { NotificationService } from './notification.service';
import { AUTH_CONFIG } from '../auth/auth.config';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private readonly notificationService: NotificationService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Erros de autenticação esperados não devem poluir a UI com toast.
        if (!this.shouldSilenceErrorToast(req, error)) {
          const message = this.notificationService.getErrorMessage(error);
          this.notificationService.error(message);
        }
        return throwError(() => error);
      })
    );
  }

  private shouldSilenceErrorToast(req: HttpRequest<unknown>, error: HttpErrorResponse): boolean {
    if (error.status === 401) return true;

    const isCheckAuthRequest = req.url.includes(AUTH_CONFIG.CHECK_AUTH_ENDPOINT);
    if (isCheckAuthRequest && (error.status === 401 || error.status === 403)) {
      return true;
    }

    return false;
  }
}
