'use strict';

const PASSWORD_RULES = Object.freeze([
  'Use at least 8 characters',
  'Include at least one lowercase letter',
  'Include at least one uppercase letter',
  'Include at least one number',
  'Include at least one special character',
]);

function getPasswordErrors(password) {
  const value = typeof password === 'string' ? password : '';
  const errors = [];

  if (value.length < 8) {
    errors.push(PASSWORD_RULES[0]);
  }

  if (!/[a-z]/.test(value)) {
    errors.push(PASSWORD_RULES[1]);
  }

  if (!/[A-Z]/.test(value)) {
    errors.push(PASSWORD_RULES[2]);
  }

  if (!/\d/.test(value)) {
    errors.push(PASSWORD_RULES[3]);
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    errors.push(PASSWORD_RULES[4]);
  }

  return errors;
}

function isStrongPassword(password) {
  return getPasswordErrors(password).length === 0;
}

module.exports = {
  PASSWORD_RULES,
  getPasswordErrors,
  isStrongPassword,
};
