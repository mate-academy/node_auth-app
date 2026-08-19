'use strict';

const AppError = require('../utils/AppError');
const { assertStrongPassword } = require('./authValidators');
const { isValidEmail, isValidName, normalizeEmail } = require('./common');

function validateName(name) {
  if (!isValidName(name)) {
    throw new AppError(400, 'A valid name is required');
  }
}

function validatePasswordChange(data = {}) {
  const currentPassword = data.oldPassword || data.currentPassword;

  if (typeof currentPassword !== 'string' || !currentPassword) {
    throw new AppError(400, 'Current password is required');
  }

  assertStrongPassword(data.newPassword);

  if (data.newPassword !== data.confirmation) {
    throw new AppError(400, 'Password confirmation does not match');
  }

  return currentPassword;
}

function validateEmailChange(data = {}) {
  const email = data.email || data.newEmail;
  const emailConfirmation =
    data.emailConfirmation ||
    data.newEmailConfirmation ||
    data.confirmation;

  if (!isValidEmail(email)) {
    throw new AppError(400, 'A valid email is required');
  }

  if (normalizeEmail(email) !== normalizeEmail(emailConfirmation)) {
    throw new AppError(400, 'Confirmation must match the new email');
  }

  if (typeof data.password !== 'string' || !data.password) {
    throw new AppError(400, 'Password is required');
  }

  return normalizeEmail(email);
}

module.exports = {
  validateEmailChange,
  validateName,
  validatePasswordChange,
};
