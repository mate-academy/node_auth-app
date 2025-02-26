import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import { validationSchemas } from '../utils/validation.js';

export const authRouter = new express.Router();

authRouter.post(
  '/registration',
  validateMiddleware(validationSchemas.userSchema),
  catchError(authController.register),
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

authRouter.get('/refresh', catchError(authController.refresh));
