import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';

        if (error.error instanceof ErrorEvent) {
          // İstemci tarafı hatası
          errorMessage = `Hata: ${error.error.message}`;
        } else {
          // Sunucu tarafı hatası
          if (error.status === 401) {
            this.authService.logout();
            this.notificationService.showError(
              'Oturumunuz sonlanmı��. Lütfen tekrar giriş yapın.'
            );
          } else {
            errorMessage = `Hata Kodu: ${error.status}\nMesaj: ${error.message}`;
          }
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
