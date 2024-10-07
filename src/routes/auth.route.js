import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activate/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.get('/logout', catchError(authController.logout));
authRouter.post('/resetPassword', catchError(authController.resetPassword));
authRouter.get('/resetPassword/:resetToken', catchError(authController.reset));
authRouter.post('/updatePassword', catchError(authController.updatePassword));
