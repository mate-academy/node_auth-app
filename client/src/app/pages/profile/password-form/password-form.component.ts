import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroupDirective,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfileService } from '../../../core/services/profile.service';
import { applyServerErrors } from '../../../core/utils/form-errors';
import { passwordRulesValidator } from '../../../core/utils/password-rules';
import { matchFieldValidator } from '../../../core/utils/validators';
import { PasswordRulesComponent } from '../../../shared/password-rules/password-rules.component';

@Component({
  selector: 'app-password-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    PasswordRulesComponent,
  ],
  templateUrl: './password-form.component.html',
})
export class PasswordFormComponent {
  private fb = inject(FormBuilder);
  private profile = inject(ProfileService);
  private snackBar = inject(MatSnackBar);

  public form = this.fb.nonNullable.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, passwordRulesValidator]],
    confirmation: [
      '',
      [Validators.required, matchFieldValidator('newPassword')],
    ],
  });

  public loading = signal(false);
  public generalError = signal('');

  constructor() {
    this.form.controls.newPassword.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.form.controls.confirmation.updateValueAndValidity(),
      );
  }

  public submit(formDirective: FormGroupDirective) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.generalError.set('');

    this.profile
      .changePassword(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          formDirective.resetForm();
          this.snackBar.open('Password changed', 'OK', { duration: 3000 });
        },
        error: (err) =>
          this.generalError.set(applyServerErrors(this.form, err)),
      });
  }
}
