import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/authController.js';

export const authRouter = new Router();

// Маршрут реєстрації з перевіркою email та довжини пароля
authRouter.post(
  '/registration',
  [
    body('email').isEmail().withMessage('Некоректна поштова адреса'),
    body('password')
      .isLength({ min: 4, max: 32 })
      .withMessage('Пароль повинен бути від 4 до 32 символів'),
  ],
  authController.registration,
);

authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
