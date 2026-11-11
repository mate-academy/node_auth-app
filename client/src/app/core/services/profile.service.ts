import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MessageResponse, User } from '../models/user.model';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/profile`;

  public getProfile() {
    return this.http.get<User>(this.apiUrl);
  }

  public updateName(name: string) {
    return this.http
      .patch<User>(`${this.apiUrl}/name`, { name })
      .pipe(tap((user) => this.auth.setUser(user)));
  }

  public changePassword(data: {
    oldPassword: string;
    newPassword: string;
    confirmation: string;
  }) {
    return this.http.patch<MessageResponse>(`${this.apiUrl}/password`, data, {
      withCredentials: true,
    });
  }

  public changeEmail(data: {
    password: string;
    newEmail: string;
    confirmation: string;
  }) {
    return this.http
      .patch<User>(`${this.apiUrl}/email`, data)
      .pipe(tap((user) => this.auth.setUser(user)));
  }
}
