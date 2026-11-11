import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { applyServerErrors } from '../../../core/utils/form-errors';

@Component({
  selector: 'app-name-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './name-form.component.html',
})
export class NameFormComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private profile = inject(ProfileService);
  private snackBar = inject(MatSnackBar);

  public form = this.fb.nonNullable.group({
    name: [
      this.auth.user()?.name ?? '',
      [Validators.required, Validators.minLength(2)],
    ],
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

    this.profile
      .updateName(this.form.getRawValue().name.trim())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.form.markAsPristine();
          this.snackBar.open('Name updated', 'OK', { duration: 3000 });
        },
        error: (err) =>
          this.generalError.set(applyServerErrors(this.form, err)),
      });
  }
}
