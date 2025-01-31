import express from 'express';
import { authController } from './../controllers/auth.contoller.js';
import { catchError } from '../utils/catchError.js';
export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:email/:token',
  catchError(authController.activate),
);
authRouter.post('/login', authController.login);
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
authRouter.post('/forgotPassword', catchError(authController.forgotPassword));
authRouter.post('/resetPassword', catchError(authController.resetPassword));
