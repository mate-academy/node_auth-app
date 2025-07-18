import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.registration));
authRouter.post('/login', catchError(authController.login));
authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
authRouter.put('/forgotPassword', catchError(authController.forgotPassword));
authRouter.get(
  '/reset/:resetToken',
  catchError(authController.verifyResetToken),
);
authRouter.put('/resetPassword', catchError(authController.resetPassword));
