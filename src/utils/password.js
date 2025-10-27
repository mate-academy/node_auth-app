'use strict';

const PW_RULES_TEXT =
  // eslint-disable-next-line max-len
  'Password must be ≥8 chars and include upper, lower, digit, and special character.';

function validatePassword(pw) {
  const errors = [];

  if (typeof pw !== 'string' || pw.length < 8) {
    errors.push('Must be at least 8 characters.');
  }

  if (!/[A-Z]/.test(pw)) {
    errors.push('Must include an uppercase letter.');
  }

  if (!/[a-z]/.test(pw)) {
    errors.push('Must include a lowercase letter.');
  }

  if (!/[0-9]/.test(pw)) {
    errors.push('Must include a digit.');
  }

  if (!/[^A-Za-z0-9]/.test(pw)) {
    errors.push('Must include a special char.');
  }

  return errors;
}

module.exports = { validatePassword, PW_RULES_TEXT };
