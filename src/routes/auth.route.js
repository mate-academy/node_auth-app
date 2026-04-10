import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { guestMiddleware } from '../middlewares/guestMiddleware.js';

export const authRouter = new express.Router();

authRouter.post(
  '/registration',
  guestMiddleware,
  catchError(authController.register),
);

authRouter.post('/login', guestMiddleware, catchError(authController.login));

authRouter.get(
  '/activate/:activationToken',
  guestMiddleware,
  catchError(authController.activate),
);

authRouter.get('/refresh', catchError(authController.refresh));

authRouter.post('/logout', authMiddleware, catchError(authController.logout));

authRouter.post(
  '/forgot-password',
  guestMiddleware,
  catchError(authController.forgotPassword),
);

authRouter.get(
  '/reset-password/:resetToken',
  guestMiddleware,
  catchError(authController.checkResetToken),
);

authRouter.post(
  '/reset-password/:resetToken',
  guestMiddleware,
  catchError(authController.resetPassword),
);

authRouter.get(
  '/profile',
  authMiddleware,
  catchError(authController.getProfile),
);

authRouter.patch(
  '/profile/name',
  authMiddleware,
  catchError(authController.updateName),
);

authRouter.patch(
  '/profile/password',
  authMiddleware,
  catchError(authController.updatePassword),
);

authRouter.patch(
  '/profile/email',
  authMiddleware,
  catchError(authController.updateEmail),
);
