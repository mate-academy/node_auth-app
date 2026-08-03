'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const { authController } = require('../controllers/authController.js');
const authGuard = require('../middlewares/authGuard.js');

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

// 4. Скидання пароля (з валідацією newPassword та confirmation)
authRouter.post('/forgot-password', authController.requestPasswordReset);

authRouter.post(
  '/reset-password/:token',
  [
    body('newPassword')
      .isLength({ min: 4, max: 32 })
      .withMessage('Пароль повинен містити від 4 до 32 символів'),
    body('confirmation')
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage('Паролі не збігаються'),
  ],
  authController.resetPassword,
);

// 5. Маршрути управління профілем
authRouter.patch('/profile/name', authGuard, authController.changeName);

authRouter.patch(
  '/profile/password',
  authGuard,
  [
    body('oldPassword').notEmpty().withMessage("Старий пароль обов'язковий"),
    body('newPassword')
      .isLength({ min: 4, max: 32 })
      .withMessage('Новий пароль повинен містити від 4 до 32 символів'),
    body('confirmation')
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage('Паролі не збігаються'),
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
