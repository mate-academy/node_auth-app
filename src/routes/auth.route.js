import express from 'express';

import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { guestMiddleware } from '../middlewares/guestMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = new express.Router();

authRouter.post(
  '/registration',
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
  '/forgot-password',
  guestMiddleware,
  catchError(authController.forgotPassword),
);

authRouter.post(
  '/reset-password/:token',
  guestMiddleware,
  catchError(authController.resetPassword),
);

authRouter.post('/refresh', catchError(authController.refresh));

authRouter.post('/logout', authMiddleware, catchError(authController.logout));
