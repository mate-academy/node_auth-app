'use strict';

const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;

function normalize({ id, email, name }) {
  return { id, email, name };
}

function validateEmail(email) {
  if (!email) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(email)) {
    return 'Email is not valid';
  }
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `At least ${MIN_PASSWORD_LENGTH} characters`;
  }
}

function validateName(name) {
  if (!name) {
    return 'Name is required';
  }
}

const userService = {
  normalize,
  validateEmail,
  validatePassword,
  validateName,
};

module.exports = { userService };
