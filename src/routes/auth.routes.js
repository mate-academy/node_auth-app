/* eslint-disable no-console */
/* eslint-disable no-undef */
import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../untils/catchError.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);

authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));

authRouter.post('/reset', catchError(authController.reset));

authRouter.post(
  '/resetPassword/:resetToken',
  catchError(authController.resetPassword),
);
