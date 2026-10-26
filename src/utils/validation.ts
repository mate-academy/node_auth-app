const NAME_REGEX = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+([ '’-][a-zA-Zа-яА-ЯіІїЇєЄґҐ]+)*$/;
const EMAIL_REGEX = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

export const PASSWORD_RULES = [
  'At least 8 characters',
  'At least one lowercase letter',
  'At least one uppercase letter',
  'At least one digit',
];

export function validateName(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return 'Name is required';
  }

  if (trimmed.length < 2 || trimmed.length > 50) {
    return 'At least 2 characters and no more than 50 characters';
  }

  return NAME_REGEX.test(trimmed) ? undefined : 'Name is not valid';
}

export function validateEmail(email: string) {
  if (!email.trim()) {
    return 'Email is required';
  }

  return EMAIL_REGEX.test(email.trim()) ? undefined : 'Email is not valid';
}

// keep in sync with login-server/src/utils/validation.js
export function validatePassword(password: string) {
  if (!password) {
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

  return undefined;
}
