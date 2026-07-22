'use strict';

const { validatePassword } = require('./passwordRules');

function requireFields(body, fields) {
  return fields.filter(
    (field) => !body[field] || String(body[field]).trim() === '',
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePasswordPair(password, confirmation) {
  if (password !== confirmation) {
    return 'Password confirmation must match';
  }

  if (!validatePassword(password)) {
    return 'Password does not match the rules';
  }

  return null;
}

module.exports = {
  isValidEmail,
  requireFields,
  validatePasswordPair,
};
