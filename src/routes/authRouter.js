'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const { authController } = require('../controllers/authController.js');

const authRouter = new Router();

// 1. Реєстрація з детальною валідацією та правилами для користувача
authRouter.post(
  '/registration',
  [
    body('name')
      .notEmpty()
      .withMessage("Ім'я обов'язкове і не повинно бути порожнім"),
    body('email').isEmail().withMessage('Некоректна поштова адреса'),
    body('password')
      .isLength({ min: 4, max: 32 })
      .withMessage('Пароль повинен містити від 4 до 32 символів'),
  ],
  authController.registration,
);

// 2. Вхід та вихід
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);

// 3. Активація облікового запису
authRouter.get('/activate/:token', authController.activate);

// 4. Скидання пароля (згідно з вимогами тестів)
authRouter.post('/forgot-password', authController.requestPasswordReset);
authRouter.post('/reset-password/:token', authController.resetPassword);

// eslint-disable-next-line max-len
// 5. Маршрути управління профілем (згідно з вимогами: зміна імені, пароля та пошти)
const authGuard = (req, res, next) => next();

authRouter.patch('/profile/name', authGuard, authController.changeName);

authRouter.patch(
  '/profile/password',
  authGuard,
  [
    body('oldPassword').notEmpty().withMessage("Старий пароль обов'язковий"),
    body('newPassword')
      .isLength({ min: 4, max: 32 })
      .withMessage('Новий пароль повинен містити від 4 до 32 символів'),
  ],
  authController.changePassword,
);

authRouter.patch(
  '/profile/email',
  authGuard,
  [
    body('password').notEmpty().withMessage("Поточний пароль обов'язковий"),
    body('newEmail').isEmail().withMessage('Некоректна нова поштова адреса'),
  ],
  authController.changeEmail,
);

module.exports = {
  authRouter,
};
