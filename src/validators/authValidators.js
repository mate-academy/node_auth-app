'use strict';

const AppError = require('../utils/AppError');
const { getPasswordErrors } = require('../utils/passwordRules');
const { isValidEmail, isValidName } = require('./common');

function assertStrongPassword(password) {
  const errors = getPasswordErrors(password);

  if (errors.length > 0) {
    throw new AppError(400, 'Password does not meet the requirements', {
      password: errors,
    });
  }
}

function validateRegistration({ name, email, password } = {}) {
  if (!isValidName(name)) {
    throw new AppError(400, 'A valid name is required');
  }

  if (!isValidEmail(email)) {
    throw new AppError(400, 'A valid email is required');
  }

  assertStrongPassword(password);
}

function validateLogin({ email, password } = {}) {
  if (!isValidEmail(email) || typeof password !== 'string' || !password) {
    throw new AppError(400, 'Email and password are required');
  }
}

function validateReset({ password, confirmation } = {}) {
  assertStrongPassword(password);

  if (password !== confirmation) {
    throw new AppError(400, 'Password confirmation does not match');
  }
}

module.exports = {
  assertStrongPassword,
  validateLogin,
  validateRegistration,
  validateReset,
};
