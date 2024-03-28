'use strict';

const joi = require('joi');

const { userFields } = require('../../fields/user-fields.js');

const { password } = userFields;

const resetSchema = joi
  .object({
    password,
  })
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

module.exports = {
  resetSchema,
};
