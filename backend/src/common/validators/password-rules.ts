/** Keep in sync with src/frontend/app/lib/shema.ts passwordSchema */
export const PASSWORD_VALIDATION_MESSAGES = {
  minLength: 'Password must be at least 8 characters',
  uppercase: 'Password must include at least one uppercase letter',
  lowercase: 'Password must include at least one lowercase letter',
  number: 'Password must include at least one number',
  special: 'Password must include at least one special character',
} as const;

export const PASSWORD_RULE_PATTERNS = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
} as const;
