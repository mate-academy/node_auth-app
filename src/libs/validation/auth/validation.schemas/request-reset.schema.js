'use strict';

const joi = require('joi');

const { userFields } = require('../../fields/user-fields.js');

const { email } = userFields;

const requestResetSchema = joi
  .object({
    email,
  })
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

module.exports = {
  requestResetSchema,
};
