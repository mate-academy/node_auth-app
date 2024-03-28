'use strict';

const joi = require('joi');

const { userFields } = require('../../fields/user-fields.js');

const { username } = userFields;

const usernameEditSchema = joi
  .object({
    username,
  })
  .required()
  .options({
    abortEarly: false,
    allowUnknown: false,
  });

module.exports = {
  usernameEditSchema,
};
