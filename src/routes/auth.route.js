import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import { validationSchemas } from '../utils/validation.js';
import { refreshTokenMiddleware } from '../middlewares/refreshTokenMiddleware.js';
export const authRouter = new express.Router();

authRouter.post(
  '/registration',
  validateMiddleware(validationSchemas.userSchema),
  catchError(authController.register),
);

authRouter.post(
  '/forgot-password',
  validateMiddleware(validationSchemas.emailSchema),
  catchError(authController.requestPasswordReset),
);

authRouter.post(
  '/reset-password/:resetToken',
  validateMiddleware(validationSchemas.passwordSchema),
  catchError(authController.passwordReset),
);

authRouter.post(
  '/login',
  validateMiddleware(validationSchemas.loginSchema),
  catchError(authController.login),
);

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);

authRouter.get('/logout', catchError(authController.logout));

authRouter.get(
  '/refresh',
  refreshTokenMiddleware,
  catchError(authController.refresh),
);
