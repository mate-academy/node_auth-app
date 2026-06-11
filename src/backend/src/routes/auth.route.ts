import express, { type Request, type Response } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import {
  activationSchema,
  confirmPasswordResetSchema,
  loginSchema,
  registerSchema,
  requestPasswordResetSchema,
} from '../schemas/auth.validation.js';
import { catchError } from '../lib/catchError.js';

export const authRouter = express.Router();

authRouter.post(
  '/register',
  validateMiddleware(registerSchema),
  catchError(authController.register),
);

authRouter.get(
  '/activation',
  validateMiddleware(activationSchema, 'query'),
  catchError(authController.activate),
);

authRouter.post(
  '/login',
  validateMiddleware(loginSchema),
  catchError(authController.login),
);

authRouter.post('/logout', catchError(authController.logout));

authRouter.get('/refresh', catchError(authController.refresh));

authRouter.post(
  '/password-reset',
  validateMiddleware(requestPasswordResetSchema),
  catchError(authController.requestPasswordReset),
);

authRouter.post(
  '/password-reset/confirm',
  validateMiddleware(confirmPasswordResetSchema),
  catchError(authController.confirmPasswordReset),
);
