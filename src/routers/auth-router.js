import express from 'express';
import { authController } from '../controllers/auth-controller.js';
import { catchError } from '../utils/catch-error.js';
import { guestMiddleware } from '../middlewares/guest-middleware.js';

export const authRouter = new express.Router();

authRouter.post(
  '/registration',
  catchError(guestMiddleware),
  catchError(authController.register),
);

authRouter.get(
  '/activation/:activationToken',
  catchError(guestMiddleware),
  catchError(authController.activate),
);

authRouter.get('/refresh', catchError(authController.refresh));

authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout', catchError(authController.logout));
