import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { guestMiddleware } from '../middlewares/guestMiddleware.js';

export const authRouter = new express.Router();

authRouter.post(
  '/register',
  guestMiddleware,
  catchError(authController.register),
);

authRouter.get(
  '/activation/:activationToken',
  guestMiddleware,
  catchError(authController.activate),
);

authRouter.post('/login', guestMiddleware, catchError(authController.login));

authRouter.post(
  '/password-reset',
  guestMiddleware,
  catchError(authController.requestPasswordReset),
);

authRouter.post(
  '/password-reset/:resetToken',
  guestMiddleware,
  catchError(authController.resetPassword),
);

authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));
