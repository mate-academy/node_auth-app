function normalize({ id, email, name }) {
  return { id, email, name };
}

function validateEmail(email) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }

  return null;
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }

  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain letters');
  }

  if (errors.length > 0) {
    return `Password must contain ${errors.join(', ')}`;
  }

  return null;
}

function validateName(name) {
  if (!name) {
    return 'Name is required';
  }

  if (name.trim().length === 0) {
    return 'Name cannot be empty';
  }

  if (name.length > 50) {
    return 'Name is too long';
  }

  return null;
}

export const userService = {
  normalize,
  validateEmail,
  validatePassword,
  validateName,
};
