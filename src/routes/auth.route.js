import express from 'express';
import { authController } from '../controller/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { authMiddleware, guestOnly } from '../middlewares/authMiddleware.js';

export const authRouter = new express.Router();

authRouter.post('/register', guestOnly, catchError(authController.register));

authRouter.get(
  '/activate/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', guestOnly, catchError(authController.login));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));

authRouter.post(
  '/request-password-reset',
  guestOnly,
  catchError(authController.requestPasswordReset),
);

authRouter.get(
  '/reset-password/:token',
  guestOnly,
  catchError(authController.verifyResetToken),
);

authRouter.post(
  '/reset-password/:token',
  guestOnly,
  catchError(authController.resetPassword),
);
