import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { applyServerErrors } from '../../core/utils/form-errors';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  public form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  public loading = signal(false);
  public generalError = signal('');

  public submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.generalError.set('');

    const { email } = this.form.getRawValue();

    this.auth
      .requestPasswordReset(email)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () =>
          this.router.navigate(['/reset-email-sent'], { state: { email } }),
        error: (err) =>
          this.generalError.set(applyServerErrors(this.form, err)),
      });
  }
}
