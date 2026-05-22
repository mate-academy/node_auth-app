import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { guestMiddleware } from '../middlewares/guest.middleware.js';

export const authRouter = Router();

authRouter.post('/register', guestMiddleware, authController.register);
authRouter.post('/login', guestMiddleware, authController.login);
authRouter.post('/activate/:email/:token', authController.activate);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);

authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password', authController.resetPassword);

authRouter.patch('/profile', authMiddleware, authController.updateProfile);

authRouter.patch(
  '/profile/password',
  authMiddleware,
  authController.updatePassword,
);
