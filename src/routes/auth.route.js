import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.get('/logout', catchError(authController.logout));
authRouter.post('/pwdReset/', catchError(authController.reqPwdReset));

authRouter.get(
  '/pwdReset/:pwdResetToken',
  catchError(authController.validatePwResetToken),
);

authRouter.post(
  '/pwdReset/:pwdResetToken',
  catchError(authController.pwdReset),
);
