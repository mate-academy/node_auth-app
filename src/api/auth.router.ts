import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import cookieParser from 'cookie-parser';
import { catchError } from '../utils/catchError.js';

export const authRouter = express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:email/:token',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', cookieParser(), catchError(authController.refresh));
authRouter.post('/logout', cookieParser(), catchError(authController.logout));

authRouter.post(
  '/reset-password',
  catchError(authController.requestPasswordReset),
);

authRouter.post(
  '/reset-password/:email/:token',
  catchError(authController.resetPassword),
);
