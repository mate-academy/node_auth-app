import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './core/services/auth.service';
import { ProfileService } from './core/services/profile.service';
import { forkJoin } from 'rxjs';
import { HeaderComponent } from './layout/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatButtonModule,
    JsonPipe,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  auth = inject(AuthService);
  profile = inject(ProfileService);

  login() {
    this.auth.login('mykhailo.oliinyk9@gmail.com', 'Misha5726').subscribe({
      error: (err: HttpErrorResponse) => console.log('Login error:', err.error),
    });
  }

  logout() {
    this.auth.logout().subscribe({
      error: (err: HttpErrorResponse) =>
        console.log('Logout error:', err.error),
    });
  }

  loadProfile() {
    this.profile.getProfile().subscribe({
      next: (user) => console.log('Profile:', user),
      error: (err: HttpErrorResponse) =>
        console.log('Profile error:', err.error),
    });
  }

  loadProfileThreeTimes() {
    forkJoin([
      this.profile.getProfile(),
      this.profile.getProfile(),
      this.profile.getProfile(),
    ]).subscribe({
      next: (users) => console.log('3 profiles:', users),
      error: (err: HttpErrorResponse) => console.log('Error:', err.error),
    });
  }
}
