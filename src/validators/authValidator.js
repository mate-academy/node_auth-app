'use strict';

const fields = require('./fields');
const passwordRules = require('./passwordRules');

function validateRegistration(body) {
  const data = body || {};
  const userName = fields.cleanName(data.name);
  const email = fields.normEmail(data.email);
  const password = fields.asText(data.password);
  const errors = [];

  if (!fields.nameValid(userName)) {
    errors.push('Name is required (up to 80 characters).');
  }

  if (!fields.isEmail(email)) {
    errors.push('Enter a valid email address.');
  }

  errors.push(...passwordRules.passwordErrors(password));

  return {
    errors,
    password,
    values: { name: userName, email },
  };
}

function validateNewPassword(body) {
  const data = body || {};
  const password = fields.asText(data.password);
  const errors = passwordRules.passwordErrors(password);

  if (password !== fields.asText(data.confirmation)) {
    errors.push('Password and confirmation must be equal.');
  }

  return {
    errors,
    password,
  };
}

module.exports = {
  validateRegistration,
  validateNewPassword,
};
