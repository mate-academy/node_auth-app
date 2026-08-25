'use strict';

const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;

const PASSWORD_RULES = [
  `at least ${MIN_PASSWORD_LENGTH} characters`,
  'at least one letter',
  'at least one digit',
];

function normalize({ id, name, email }) {
  return { id, name, email };
}

function validateName(name) {
  if (!name) {
    return 'Name is required';
  }

  if (name.length < 2) {
    return 'At least 2 characters';
  }
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

  if (!/[a-zA-Z]/.test(password)) {
    return 'At least one letter';
  }

  if (!/[0-9]/.test(password)) {
    return 'At least one digit';
  }
}

function validateConfirmation(password, confirmation) {
  if (!confirmation) {
    return 'Confirmation is required';
  }

  if (password !== confirmation) {
    return 'Passwords do not match';
  }
}

module.exports = {
  userService: {
    PASSWORD_RULES,
    normalize,
    validateName,
    validateEmail,
    validatePassword,
    validateConfirmation,
  },
};
