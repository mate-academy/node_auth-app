'use strict';

const { body } = require('express-validator');

const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage("Ім’я обов'язкове і не повинно бути порожнім"),
  body('email').isEmail().withMessage('Некоректна поштова адреса'),
  body('password')
    .isLength({ min: 4, max: 32 })
    .withMessage('Пароль повинен бути від 4 до 32 символів'),
];

module.exports = {
  registerValidation,
};
