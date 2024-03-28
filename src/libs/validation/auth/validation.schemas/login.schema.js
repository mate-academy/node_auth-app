'use strict';

const joi = require('joi');

const { userFields } = require('../../fields/user-fields.js');

const { email, password } = userFields;

const loginSchema = joi
  .object({
    email,
    password,
  })
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

module.exports = {
  loginSchema,
};
