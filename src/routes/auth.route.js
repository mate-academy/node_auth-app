import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchErrors.js';

export const authRouter = new express.Router();

// eslint-disable-next-line max-len
authRouter.post('/registration', catchError(authController.register)); // registrate new user

// confirm email
authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login)); // login user
authRouter.get('/refresh', catchError(authController.refresh)); // login user
authRouter.post('/logout', catchError(authController.logout));
