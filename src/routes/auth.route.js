import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { guestMiddleware } from '../middlewares/guest.middleware.js';

export const authRouter = new express.Router();

authRouter.post(
  '/register',
  guestMiddleware,
  catchError(authController.register),
);

authRouter.get(
  '/activate/:activationToken',
  guestMiddleware,
  catchError(authController.activate),
);
authRouter.post('/login', guestMiddleware, catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));

authRouter.post(
  '/password-reset',
  guestMiddleware,
  catchError(authController.requestPasswordReset),
);

authRouter.post(
  '/password-reset/:token',
  guestMiddleware,
  catchError(authController.resetPassword),
);
