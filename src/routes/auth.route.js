import express from 'express';

import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.registration));

authRouter.get(
  '/activation/:userEmail/:activationToken',
  catchError(authController.activate),
);

authRouter.post('/login', catchError(authController.login));

authRouter.get('/refresh', catchError(authController.refresh));

authRouter.post('/logout', authMiddleware, catchError(authController.logout));

authRouter.post('/reset', catchError(authController.sendResetPassword));

authRouter.get('/reset/:resetToken', catchError(authController.resetPassword));
