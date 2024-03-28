'use strict';

const joi = require('joi');

const { userFields } = require('../../fields/user-fields.js');

const { username, email, password } = userFields;

const signupSchema = joi
  .object({
    username,
    email,
    password,
  })
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

module.exports = {
  signupSchema,
};
