'use strict';

const validatePassword = (password) => {
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasUppercase) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!hasLowercase) {
    return 'Password must contain at least one lowercase letter';
  }

  if (!hasNumber) {
    return 'Password must contain at least one number';
  }

  return null;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return 'Invalid email address';
  }

  return null;
};

module.exports = {
  validatePassword, validateEmail,
};
