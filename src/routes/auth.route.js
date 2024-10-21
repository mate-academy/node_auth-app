import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../catchError.js';

export const authRouter = new express.Router();

authRouter.post('/registration', authController.registration);

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
authRouter.post('/reset-password', catchError(authController.reset));

authRouter.post(
  '/reset-password/:activationToken',
  catchError(authController.changePassword),
);
