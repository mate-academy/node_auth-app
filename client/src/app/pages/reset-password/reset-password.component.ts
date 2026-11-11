import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { applyServerErrors } from '../../core/utils/form-errors';
import { passwordRulesValidator } from '../../core/utils/password-rules';
import { matchFieldValidator } from '../../core/utils/validators';
import { PasswordRulesComponent } from '../../shared/password-rules/password-rules.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    PasswordRulesComponent,
  ],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private token = inject(ActivatedRoute).snapshot.paramMap.get('token') ?? '';

  form = this.fb.nonNullable.group({
    password: ['', [Validators.required, passwordRulesValidator]],
    confirmation: ['', [Validators.required, matchFieldValidator('password')]],
  });

  loading = signal(false);
  generalError = signal('');

  constructor() {
    this.form.controls.password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.form.controls.confirmation.updateValueAndValidity(),
      );
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.generalError.set('');

    const { password, confirmation } = this.form.getRawValue();

    this.auth
      .resetPassword(this.token, password, confirmation)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () =>
          this.router.navigate(['/reset-success'], { replaceUrl: true }),
        error: (err) =>
          this.generalError.set(applyServerErrors(this.form, err)),
      });
  }
}
