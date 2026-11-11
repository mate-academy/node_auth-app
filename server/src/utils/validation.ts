export const PASSWORD_RULES = [
  'At least 8 characters',
  'At least one lowercase letter',
  'At least one uppercase letter',
  'At least one digit',
];

export function validateName(name: unknown): string | undefined {
  if (typeof name !== 'string' || !name.trim()) {
    return 'Name is required';
  }

  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
}

export function validateEmail(email: unknown): string | undefined {
  if (typeof email !== 'string' || !email.trim()) {
    return 'Email is required';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Email is not valid';
  }
}

export function validatePassword(password: unknown): string | undefined {
  if (typeof password !== 'string' || !password) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'At least 8 characters';
  }

  if (!/[a-z]/.test(password)) {
    return 'At least one lowercase letter';
  }

  if (!/[A-Z]/.test(password)) {
    return 'At least one uppercase letter';
  }

  if (!/\d/.test(password)) {
    return 'At least one digit';
  }
}
