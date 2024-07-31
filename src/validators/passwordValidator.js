export function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (/\s/.test(value)) {
    return 'Password should not contain spaces';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}
