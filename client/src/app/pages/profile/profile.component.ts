import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/services/auth.service';
import { NameFormComponent } from './name-form/name-form.component';
import { PasswordFormComponent } from './password-form/password-form.component';
import { EmailFormComponent } from './email-form/email-form.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatCardModule,
    NameFormComponent,
    PasswordFormComponent,
    EmailFormComponent,
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  public user = inject(AuthService).user;
}
