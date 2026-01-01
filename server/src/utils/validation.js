export function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

export function validatePassword(value) {
  const result = [];

  if (!value || value.length < 8) {
    result.push('At least 8 characters');
  }

  if (!/[A-Z]/.test(value)) {
    result.push('Capital letter');
  }

  if (!/[0-9]/.test(value)) {
    result.push('There must be at least one digit');
  }

  if (!/[!@#$%^&*]/.test(value)) {
    result.push('There must be one special character');
  }

  return result.join('. ');
}
