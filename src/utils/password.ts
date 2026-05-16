import bcrypt from 'bcrypt';

export type PasswordValidationResult = {
  isValid: boolean;
  errors: string[];
};

const SALT_ROUNDS = 10;

export function validatePassword(password: unknown): PasswordValidationResult {
  const errors: string[] = [];

  if (typeof password !== 'string') {
    return {
      isValid: false,
      errors: ['Password must be a string'],
    };
  }

  if (password.trim().length === 0) {
    errors.push('Password cannot be empty');
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function comparePasswords(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
