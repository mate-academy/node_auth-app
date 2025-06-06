import express from 'express';
import cookieParser from 'cookie-parser';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));
authRouter.get(
  '/activation/:email/:token',
  catchError(authController.activate),
);

authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', cookieParser(), catchError(authController.refresh));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));

authRouter.post('/reset', catchError(authController.resetPassword));
authRouter.post(
  '/reset/:email/:token',
  catchError(authController.resetPasswordConfirmation),
);
