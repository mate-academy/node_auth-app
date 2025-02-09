import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import cookieParser from 'cookie-parser';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));
authRouter.get(
  '/activation/:email/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
