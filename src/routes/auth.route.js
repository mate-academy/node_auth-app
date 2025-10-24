import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const authRouter = new express.Router();

authRouter.post('/register', catchError(authController.register));

authRouter.get(
  '/activate/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));
authRouter.post('/request-reset', catchError(authController.requestReset));

authRouter.post(
  '/reset-password/:resetToken',
  catchError(authController.resetPassword),
);

authRouter.patch(
  '/profile',
  authMiddleware,
  catchError(authController.updateProfile),
);
