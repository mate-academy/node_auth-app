export function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }

  if (/\s/.test(value)) {
    return 'No spaces allowed';
  }
}
