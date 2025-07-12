export function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }

  return null;
}

export const validatePassword = (value) => {
  const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,25}$/;

    if (!value) {
    return 'Password is required';
  }

  if (!passwordPattern.test(value)) {
    return 'Password should have from 6 to 25 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character'
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }

  return null;
};

export const validateUserName = (value) => {
  const usernamePattern = /^[a-zA-Z0-9_.]+$/;

    if (!value) {
    return 'Username is required'
  }

  if (!usernamePattern.test(value)) {
    return 'Username can use only letters, numbers, underscores and periods'
  }

  if (value.length < 6) {
    return 'Username should have at least 6 characters'
  }

  return null;
}
