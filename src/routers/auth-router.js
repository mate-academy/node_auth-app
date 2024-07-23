import express from 'express';
import { authController } from '../controllers/auth-controller.js';
import { catchError } from '../utils/catch-error.js';
import { guestMiddleware } from '../middlewares/guest-middleware.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';

export const authRouter = new express.Router();

authRouter.post(
  '/registration',
  catchError(guestMiddleware),
  catchError(authController.register),
);

authRouter.get(
  '/activation/:activationToken',
  catchError(guestMiddleware),
  catchError(authController.activate),
);

authRouter.get('/refresh', catchError(authController.refresh));

authRouter.post(
  '/login',
  catchError(guestMiddleware),
  catchError(authController.login),
);

authRouter.post('/logout', catchError(authController.logout));

authRouter.post(
  '/reset',
  catchError(guestMiddleware),
  catchError(authController.resetRequest),
);
authRouter.post(
  '/reset/:resetToken',
  catchError(guestMiddleware),
  catchError(authController.resetPassword),
);
