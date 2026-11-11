import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { ApiErrorResponse } from '../models/user.model';

export function applyServerErrors(form: FormGroup, error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Something went wrong';
  }

  if (error.status === 0) {
    return 'Server is not reachable';
  }

  const body = error.error as ApiErrorResponse | null;
  let appliedToField = false;

  for (const [field, message] of Object.entries(body?.errors ?? {})) {
    const control = form.get(field);

    if (control) {
      control.setErrors({ server: message });
      control.markAsTouched();
      appliedToField = true;
    }
  }

  return appliedToField ? '' : (body?.message ?? 'Something went wrong');
}
