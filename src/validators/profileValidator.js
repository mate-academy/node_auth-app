'use strict';

const fields = require('./fields');
const passwordRules = require('./passwordRules');

function validateName(body) {
  const data = body || {};
  const userName = fields.cleanName(data.name);
  const errors = [];

  if (!fields.nameValid(userName)) {
    errors.push('Name is required (up to 80 characters).');
  }

  return {
    errors,
    name: userName,
  };
}

function validatePasswordChange(body) {
  const data = body || {};
  const oldPassword = fields.asText(data.oldPassword);
  const password = fields.asText(data.password);
  const errors = passwordRules.passwordErrors(password);

  if (password !== fields.asText(data.confirmation)) {
    errors.push('New password and confirmation must be equal.');
  }

  if (errors.length === 0 && password === oldPassword) {
    errors.push('The new password must be different from the current one.');
  }

  return {
    errors,
    oldPassword,
    password,
  };
}

function validateEmailChange(body, user) {
  const data = body || {};
  const email = fields.normEmail(data.email);
  const confirmation = fields.normEmail(data.emailConfirmation);
  const errors = [];

  if (!fields.isEmail(email)) {
    errors.push('Enter a valid email address.');
  } else if (email !== confirmation) {
    errors.push('New email and confirmation must be equal.');
  } else if (email === user.email) {
    errors.push('That is already your email.');
  }

  return {
    errors,
    email,
    confirmation,
    password: fields.asText(data.password),
  };
}

module.exports = {
  validateName,
  validatePasswordChange,
  validateEmailChange,
};
