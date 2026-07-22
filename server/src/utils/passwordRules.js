'use strict';

const passwordRules = [
  'At least 8 characters',
  'At least one lowercase letter',
  'At least one uppercase letter',
  'At least one number',
];

function validatePassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  );
}

module.exports = {
  passwordRules,
  validatePassword,
};
