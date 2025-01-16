import express from 'express';
import { authController } from './conrollers/auth.controller';
import { profileController } from './conrollers/profile.controller';
import { authenticateUser } from './midlleware/authenticateUser';

const authRouter = new express.Router();

// Регистрация
authRouter.post('/register', authController.register);

// Активация email
authRouter.get('/verify-email', authController.verifyEmail);

// Логин
authRouter.post('/login', authController.login);

// Логаут
authRouter.post('/logout', authController.logout);

// Запрос на сброс пароля
authRouter.post('/reset-password', authController.resetPassword);
authRouter.post('/confirm-reset-password', authController.confirmResetPassword);

// Профиль (Только для аутентифицированных пользователей)
authRouter.get('/profile', authenticateUser, profileController.viewProfile);

authRouter.put('/profile', authenticateUser, profileController.updateProfile);

authRouter.put(
  '/change-password',
  authenticateUser,
  profileController.changePassword,
);

authRouter.put(
  '/change-email',
  authenticateUser,
  profileController.changeEmail,
);

// 404 для всех остальных маршрутов
authRouter.all('*', (req, res) => {
  res.status(404).json({ error: 'Page not found' });
});

export default authRouter;
