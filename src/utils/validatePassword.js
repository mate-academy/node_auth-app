'use strict';

const PASSWORD_RULES = [
  'Password must contain at least 8 characters',
  'Password must contain at least one lowercase letter',
  'Password must contain at least one uppercase letter',
  'Password must contain at least one number',
];

function validatePassword(password) {
  const errors = [];

  if (typeof password !== 'string') {
    return ['Password is required'];
  }

  if (password.length < 8) {
    errors.push(PASSWORD_RULES[0]);
  }

  if (!/[a-z]/.test(password)) {
    errors.push(PASSWORD_RULES[1]);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push(PASSWORD_RULES[2]);
  }

  if (!/\d/.test(password)) {
    errors.push(PASSWORD_RULES[3]);
  }

  return errors;
}

module.exports = {
  PASSWORD_RULES,
  validatePassword,
};
