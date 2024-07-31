import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));
authRouter.post('/send-activation', catchError(authController.sendActivation));
authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.post('/reset-password', catchError(authController.resetPassword));
authRouter.post(
  '/save-new-password/:resetToken',
  catchError(authController.saveNewPassword),
);
authRouter.get(
  '/change-email/:confirmNewEmailToken',
  catchError(authController.changeEmail),
);
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
