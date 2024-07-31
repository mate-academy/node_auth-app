import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.post(
  '/activation/resend',
  catchError(authController.sendActivation),
);

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);

authRouter.post('/login', catchError(authController.login));

authRouter.post('/reset-password', catchError(authController.resetPassword));

authRouter.post(
  '/reset-password/:resetToken',
  catchError(authController.saveNewPassword),
);

authRouter.get('/refresh', catchError(authController.refresh));

authRouter.patch('/change-name', catchError(authController.changeName));

authRouter.patch('/change-email', catchError(authController.changeEmail));

authRouter.get(
  '/change-email/:confirmNewEmailToken',
  catchError(authController.saveNewEmail),
);

authRouter.patch('/change-password', catchError(authController.changePassword));

authRouter.post('/logout', catchError(authController.logout));
