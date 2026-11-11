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
import { matchFieldValidator } from '../../../core/utils/validators';

@Component({
  selector: 'app-email-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './email-form.component.html',
})
export class EmailFormComponent {
  private fb = inject(FormBuilder);
  private profile = inject(ProfileService);
  private snackBar = inject(MatSnackBar);

  public form = this.fb.nonNullable.group({
    password: ['', Validators.required],
    newEmail: ['', [Validators.required, Validators.email]],
    confirmation: [
      '',
      [Validators.required, matchFieldValidator('newEmail', true)],
    ],
  });

  public loading = signal(false);
  public generalError = signal('');

  constructor() {
    this.form.controls.newEmail.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.form.controls.confirmation.updateValueAndValidity(),
      );
  }

  submit(formDirective: FormGroupDirective) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.generalError.set('');

    this.profile
      .changeEmail(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          formDirective.resetForm();
          this.snackBar.open(
            'Email changed. A notice was sent to your old address.',
            'OK',
            { duration: 4000 },
          );
        },
        error: (err) =>
          this.generalError.set(applyServerErrors(this.form, err)),
      });
  }
}
