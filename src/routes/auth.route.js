import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.get('/refreshToken', catchError(authController.refresh));
authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout', catchError(authController.logout));
