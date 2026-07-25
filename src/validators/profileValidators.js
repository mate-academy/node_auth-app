'use strict';

const { body } = require('express-validator');

const { isValidPassword, PASSWORD_RULE_MESSAGE } = require('./passwordRule');

const nameValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
];

const passwordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .custom(isValidPassword)
    .withMessage(PASSWORD_RULE_MESSAGE),
  body('confirmation')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Confirmation must match the new password'),
];

const emailValidator = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  nameValidator,
  passwordValidator,
  emailValidator,
};
