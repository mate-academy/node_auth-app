'use strict';

const joi = require('joi');
const {
  UserRoles, userValidationRules,
} = require('../../../libs/enums/enums.js');

const username = joi
  .string()
  .trim()
  .min(userValidationRules.MIN_USERNAME_LENGTH)
  .max(userValidationRules.MAX_USERNAME_LENGTH)
  .required()
  .messages({
    'any.required': 'Username is required',
    'string.empty': 'Username is required',
    'string.min': 'At least {#limit} characters',
    'string.max': 'At most {#limit} characters',
  });

const email = joi
  .string()
  .trim()
  .email()
  .required()
  .messages({
    'any.required': 'Email is required',
    'string.empty': 'Email is required',
    'string.email': 'Email is not valid',
  });

const password = joi
  .string()
  .trim()
  .min(userValidationRules.MIN_PASSWORD_LENGTH)
  .required()
  .messages({
    'any.required': 'Password is required',
    'string.empty': 'Password is required',
    'string.min': 'At least {#limit} characters',
  });

const role = joi
  .string()
  .valid(UserRoles.USER, UserRoles.ADMIN)
  .required()
  .messages({
    'any.required': 'Role is required',
    'string.empty': 'Role is required',
    'any.only': 'Invalid role',
  });

const userFields = {
  username,
  email,
  password,
  role,
};

module.exports = {
  userFields,
};
