import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { CheckEmailComponent } from './pages/check-email/check-email.component';
import { ActivateComponent } from './pages/activate/activate.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetEmailSentComponent } from './pages/reset-email-sent/reset-email-sent.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ResetSuccessComponent } from './pages/reset-success/reset-success.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'profile' },

  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: 'check-email',
    component: CheckEmailComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'activate/:token',
    component: ActivateComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'reset-email-sent',
    component: ResetEmailSentComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'reset-password/:token',
    component: ResetPasswordComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'reset-success',
    component: ResetSuccessComponent,
    canActivate: [guestGuard],
  },

  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

  { path: '**', component: NotFoundComponent },
];
