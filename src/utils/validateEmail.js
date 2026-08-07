'use strict';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }

  return EMAIL_PATTERN.test(email.trim());
}

module.exports = {
  validateEmail,
};
