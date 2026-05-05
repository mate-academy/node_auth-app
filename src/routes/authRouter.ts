import { Router } from 'express';
import {
  registration,
  activation,
  login,
  refreshing,
  logout,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { notAuthMiddleware } from '../middlewares/notAuthMiddleware';

export const authRouter = Router();

authRouter.post('/registration', notAuthMiddleware, registration);
authRouter.get('/activation/:activationToken', notAuthMiddleware, activation);
authRouter.post('/login', notAuthMiddleware, login);
authRouter.post('/forgot-password', notAuthMiddleware, forgotPassword);

authRouter.post(
  '/reset-password/:resetToken',
  notAuthMiddleware,
  resetPassword,
);

authRouter.post('/refresh', refreshing);
authRouter.post('/logout', authMiddleware, logout);
