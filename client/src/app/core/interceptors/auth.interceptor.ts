import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

function prepare(req: HttpRequest<unknown>, token: string | null) {
  return req.clone({
    withCredentials: true,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const isRefreshRequest = req.url.endsWith('/auth/refresh');

  return next(prepare(req, auth.accessToken)).pipe(
    catchError((error: unknown) => {
      const isUnauthorized =
        error instanceof HttpErrorResponse && error.status === 401;

      if (!isUnauthorized || isRefreshRequest) {
        return throwError(() => error);
      }

      return auth.refresh().pipe(
        catchError((refreshError) => {
          auth.clearSession();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        }),
        switchMap(() => next(prepare(req, auth.accessToken))),
      );
    }),
  );
};
