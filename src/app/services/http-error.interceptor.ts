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

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private readonly notificationService: NotificationService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Erros 401 são tratados pelo AuthInterceptor (refresh/redirect), não exibe toast aqui
        if (error.status !== 401) {
          const message = this.notificationService.getErrorMessage(error);
          this.notificationService.error(message);
        }
        return throwError(() => error);
      })
    );
  }
}
