import { ValidatorFn } from '@angular/forms';

export const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'One lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One digit', test: (v: string) => /\d/.test(v) },
];

export const passwordRulesValidator: ValidatorFn = (control) => {
  const value: string = control.value ?? '';
  const failed = PASSWORD_RULES.filter((rule) => !rule.test(value)).map(
    (r) => r.label,
  );

  return failed.length ? { passwordRules: failed } : null;
};
