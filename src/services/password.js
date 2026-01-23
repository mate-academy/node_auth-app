'use strict';

function validatePassword(password) {
  if (typeof password !== 'string') {
    return false;
  }

  if (password.length < 8) {
    return false;
  }

  if (!/[A-Za-z]/.test(password)) {
    return false;
  }

  if (!/\d/.test(password)) {
    return false;
  }

  return true;
}

module.exports = { validatePassword };
