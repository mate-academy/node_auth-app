'use strict';

const { body } = require('express-validator');

const { isValidPassword, PASSWORD_RULE_MESSAGE } = require('./passwordRule');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').custom(isValidPassword).withMessage(PASSWORD_RULE_MESSAGE),
];

const loginValidator = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  registerValidator,
  loginValidator,
};
