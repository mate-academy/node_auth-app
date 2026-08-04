export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function validateEmail(value) {
  if (!value || typeof value !== 'string') {
    return 'Email is required';
  }

  const normalizedEmail = value.trim();

  if (normalizedEmail.length > 254) {
    return 'Email is too long';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return 'Email is not valid';
  }

  return null;
}

export function validatePassword(value) {
  if (!value || typeof value !== 'string') {
    return 'Password is required';
  }

  if (value.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (!/[a-z]/.test(value)) {
    return 'Password must contain at least one lowercase letter';
  }

  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/\d/.test(value)) {
    return 'Password must contain at least one number';
  }

  return null;
}

export function validateName(value) {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return 'Name is required';
  }

  const normalizedName = value.trim();

  if (normalizedName.length < 2) {
    return 'Name must contain at least 2 characters';
  }

  if (normalizedName.length > 50) {
    return 'Name must contain no more than 50 characters';
  }

  return null;
}
