'use strict';

const passwordRules = [
  'At least 8 characters long',
  'Contains at least one uppercase letter',
  'Contains at least one lowercase letter',
  'Contains at least one number',
  'Contains at least one special character (!@#$%^&*)',
];

const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push(passwordRules[0]);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push(passwordRules[1]);
  }

  if (!/[a-z]/.test(password)) {
    errors.push(passwordRules[2]);
  }

  if (!/\d/.test(password)) {
    errors.push(passwordRules[3]);
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push(passwordRules[4]);
  }

  return errors;
};

module.exports = {
  passwordRules,
  validatePassword,
};
