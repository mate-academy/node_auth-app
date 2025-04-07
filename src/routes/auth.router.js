import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { catchError } from '../middleware/catch.error.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));

authRouter.post(
  '/logout',
  catchError(authMiddleware),
  catchError(authController.logout),
);

authRouter.get(
  '/refresh',
  catchError(authMiddleware),
  catchError(authController.refresh),
);

authRouter.post(
  '/request-password-reset',
  catchError(authController.requestPasswordReset),
);

authRouter.post(
  '/reset-password/:resetPasswordToken',
  catchError(authController.resetPassword),
);
