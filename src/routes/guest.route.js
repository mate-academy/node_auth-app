import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { guestMiddleware } from '../middlewares/guestMiddleware.js';

export const guestRouter = new express.Router();

guestRouter.post(
  '/registration',
  guestMiddleware,
  catchError(authController.register),
);
guestRouter.post('/login', guestMiddleware, catchError(authController.login));

guestRouter.get(
  '/activation/:activationToken',
  guestMiddleware,
  catchError(authController.activate),
);

guestRouter.post(
  '/password-reset',
  guestMiddleware,
  catchError(authController.requestPasswordReset),
);

guestRouter.post(
  '/password-reset/:token',
  guestMiddleware,
  catchError(authController.passwordReset),
);
