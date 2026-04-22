'use strict';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(name) {
  if (!name || String(name).trim().length === 0) {
    return 'Name is required';
  }

  return null;
}

function validateEmail(email) {
  if (!email || !EMAIL_REGEX.test(email)) {
    return 'Invalid email address';
  }

  return null;
}

function validatePassword(password) {
  if (!password || password.length < 12) {
    return 'Password must be at least 12 characters';
  }

  if ((password.match(/\d/g) || []).length < 2) {
    return 'Password must contain at least 2 numbers';
  }

  return null;
}

module.exports = { validateName, validateEmail, validatePassword };
