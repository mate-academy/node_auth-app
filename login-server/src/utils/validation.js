const NAME_REGEX = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ]+([ '’-][a-zA-Zа-яА-ЯіІїЇєЄґҐ]+)*$/;
const EMAIL_REGEX = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

export function validateName(name) {
  if (typeof name !== 'string' || !name.trim()) {
    return 'Name is required';
  }

  const trimmed = name.trim();

  if (trimmed.length < 2 || trimmed.length > 50) {
    return 'At least 2 characters and no more than 50 characters';
  }

  return NAME_REGEX.test(trimmed) ? undefined : 'Name is not valid';
}

export function validateEmail(email) {
  if (typeof email !== 'string' || !email.trim()) {
    return 'Email is required';
  }

  return EMAIL_REGEX.test(email.trim()) ? undefined : 'Email is not valid';
}

// Password rules (keep in sync with src/utils/validation.ts on the client)
export function validatePassword(password) {
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

  return undefined;
}

export function normalizeEmail(email) {
  return String(email ?? '')
    .trim()
    .toLowerCase();
}
