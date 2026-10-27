import express from 'express';
import { authContoller } from '../controllers/auth.conroller.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authContoller.register));
authRouter.get(
  '/activation/:activationToken',
  catchError(authContoller.activate),
);
authRouter.post('/login', catchError(authContoller.login));
authRouter.get('/refresh', catchError(authContoller.refresh));
authRouter.post('/logout', catchError(authContoller.logout));
authRouter.post('/reset-password', catchError(authContoller.resetPassword));
authRouter.post(
  '/reset-password/:token',
  catchError(authContoller.sendResetPassword),
);
