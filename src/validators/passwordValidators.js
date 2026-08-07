'use strict';

const { body } = require('express-validator');

const { isValidPassword, PASSWORD_RULE_MESSAGE } = require('./passwordRule');

const forgotValidator = [
  body('email').isEmail().withMessage('Email must be valid'),
];

const resetValidator = [
  body('password').custom(isValidPassword).withMessage(PASSWORD_RULE_MESSAGE),
  body('confirmation')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Confirmation must match the password'),
];

module.exports = {
  forgotValidator,
  resetValidator,
};
