export function validateName(value) {
  if (!value) {
    return 'Name is required';
  }

  if (value.length < 2) {
    return 'At least 2 characters';
  }
}
