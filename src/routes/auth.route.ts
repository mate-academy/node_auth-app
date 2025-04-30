import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const authRoute = Router();

authRoute.post('/registration', authController.register);
authRoute.get('/activation/:token', authController.activate);

authRoute.post('/login', authController.login);
authRoute.post('/logout', authController.logout);
authRoute.get('/refresh', cookieParser(), authController.refresh);

authRoute.post('/password-reset', authController.requestPasswordReset);
authRoute.post('/password-reset/:token', authController.resetPassword);

authRoute.post(
  '/change-email',
  authMiddleware,
  authController.requestEmailChange,
);

authRoute.get('/change-email/:token', authController.changeEmail);
