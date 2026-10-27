'use strict';

const PASSWORD_RULES = [
  {
    message: 'At least 8 characters long',
    test: (password) => password.length >= 8,
  },
  {
    message: 'At most 64 characters long',
    test: (password) => password.length <= 64,
  },
  {
    message: 'At least one uppercase letter (A-Z)',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    message: 'At least one lowercase letter (a-z)',
    test: (password) => /[a-z]/.test(password),
  },
  {
    message: 'At least one digit (0-9)',
    test: (password) => /\d/.test(password),
  },
  {
    message: 'At least one special character (e.g. !@#$%)',
    test: (password) => /[^A-Za-z0-9\s]/.test(password),
  },
  {
    message: 'No spaces',
    test: (password) => !/\s/.test(password),
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(name) {
  if (typeof name !== 'string' || !name.trim()) {
    return 'Name is required';
  }

  if (name.trim().length < 2 || name.trim().length > 50) {
    return 'Name must be between 2 and 50 characters';
  }

  return null;
}

function validateEmail(email) {
  if (typeof email !== 'string' || !email.trim()) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'Email is not valid';
  }

  return null;
}

// пустий пароль ок
function validatePassword(password) {
  if (typeof password !== 'string' || !password) {
    return ['Password is required'];
  }

  return PASSWORD_RULES.filter((rule) => !rule.test(password)).map(
    (rule) => rule.message,
  );
}

module.exports = {
  PASSWORD_RULES,
  validateName,
  validateEmail,
  validatePassword,
};
