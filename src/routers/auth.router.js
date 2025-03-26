'use strict';

import { Router as ExpressRouter } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import cookieParser from 'cookie-parser';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { notAuthMiddleware } from '../middlewares/notAuthMiddleware.js';

export const authRouter = ExpressRouter();

authRouter.post(
  '/registration',
  notAuthMiddleware,
  catchError(authController.register),
);

authRouter.get(
  '/activate/:email/:activationToken',
  notAuthMiddleware,
  catchError(authController.activate),
);

authRouter.post('/login', notAuthMiddleware, catchError(authController.login));

authRouter.post(
  '/forgot-password',
  notAuthMiddleware,
  catchError(authController.forgotPassword),
);

authRouter.post(
  '/reset-password',
  notAuthMiddleware,
  catchError(authController.resetPassword),
);

authRouter.get('/refresh', cookieParser(), catchError(authController.refresh));

authRouter.post(
  '/logout',
  cookieParser(),
  authMiddleware,
  catchError(authController.logout),
);
