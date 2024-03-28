'use strict';

const joi = require('joi');

const { userFields } = require('../../fields/user-fields.js');

const { username, email, password, role } = userFields;

const updateSchema = joi
  .object({
    username: username.optional(),
    email: email.optional(),
    password: password.optional(),
    role: role.optional(),
  })
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

module.exports = {
  updateSchema,
};
