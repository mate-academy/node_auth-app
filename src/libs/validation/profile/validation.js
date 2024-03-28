'use strict';

const { bodyValidation } = require('../../middlewares/middlewares.js');
const {
  emailEditSchema,
} = require('./validation.schemas/email-edit.schema.js');
const {
  passwordEditSchema,
} = require('./validation.schemas/password-edit.schema.js');
const {
  usernameEditSchema,
} = require('./validation.schemas/username-edit.schema.js');

const emailEditValidation = bodyValidation(emailEditSchema);
const passwordEditValidation = bodyValidation(passwordEditSchema);
const usernameEditValidation = bodyValidation(usernameEditSchema);

module.exports = {
  emailEditValidation,
  passwordEditValidation,
  usernameEditValidation,
};
