import { ValidatorFn } from '@angular/forms';

export function matchFieldValidator(
  otherField: string,
  ignoreCase = false,
): ValidatorFn {
  return (control) => {
    const other = control.parent?.get(otherField);

    if (!other || !control.value) {
      return null;
    }

    const normalize = (v: string) => (ignoreCase ? v.trim().toLowerCase() : v);

    return normalize(control.value) === normalize(other.value)
      ? null
      : { mismatch: true };
  };
}
