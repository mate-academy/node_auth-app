'use strict';

const joi = require('joi');

const { userFields } = require('../../fields/user-fields.js');

const { username, email, password, role } = userFields;

const createSchema = joi
  .object({
    username,
    email,
    password,
    role,
  })
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

module.exports = {
  createSchema,
};
