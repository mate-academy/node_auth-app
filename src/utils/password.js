'use strict';

const PASSWORD_RULES_MESSAGE = [
  'Password must be at least 8 characters long',
  'and include uppercase, lowercase and a number',
].join(' ');

function isPasswordValid(password) {
  if (typeof password !== 'string') {
    return false;
  }

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasMinLength && hasUppercase && hasLowercase && hasNumber;
}

module.exports = {
  PASSWORD_RULES_MESSAGE,
  isPasswordValid,
};
