import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  MessageResponse,
  RegisterResponse,
  User,
} from '../models/user.model';
import { catchError, finalize, Observable, of, shareReplay, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  private readonly _accessToken = signal<string | null>(null);
  private readonly _user = signal<User | null>(null);

  public readonly user = this._user.asReadonly();
  public readonly isAuthenticated = computed(() => this._user() !== null);

  private refreshRequest$: Observable<AuthResponse> | null = null;

  public get accessToken(): string | null {
    return this._accessToken();
  }

  public register(data: { name: string; email: string; password: string }) {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data);
  }

  public activate(token: string) {
    return this.http
      .get<AuthResponse>(`${this.apiUrl}/activate/${token}`, {
        withCredentials: true,
      })
      .pipe(tap((res) => this.setSession(res)));
  }

  public login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/login`,
        { email, password },
        { withCredentials: true },
      )
      .pipe(tap((res) => this.setSession(res)));
  }

  public refresh() {
    if (!this.refreshRequest$) {
      this.refreshRequest$ = this.http
        .get<AuthResponse>(`${this.apiUrl}/refresh`, { withCredentials: true })
        .pipe(
          tap((res) => this.setSession(res)),
          finalize(() => (this.refreshRequest$ = null)),
          shareReplay(1),
        );
    }

    return this.refreshRequest$;
  }

  public logout() {
    return this.http
      .post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        catchError(() => of(null)),
        tap(() => this.clearSession()),
      );
  }

  public requestPasswordReset(email: string) {
    return this.http.post<MessageResponse>(`${this.apiUrl}/reset-password`, {
      email,
    });
  }

  public resetPassword(token: string, password: string, confirmation: string) {
    return this.http.post<MessageResponse>(
      `${this.apiUrl}/reset-password/${token}`,
      { password, confirmation },
    );
  }

  public restoreSession() {
    return this.refresh().pipe(catchError(() => of(null)));
  }

  public setUser(user: User) {
    this._user.set(user);
  }

  public clearSession() {
    this._accessToken.set(null);
    this._user.set(null);
  }

  private setSession({ user, accessToken }: AuthResponse) {
    this._accessToken.set(accessToken);
    this._user.set(user);
  }
}
