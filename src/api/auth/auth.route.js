import express from 'express';
import { authController } from './auth.controller.js';
import { catchError } from '../../utils/catchError.js';

const { Router } = express;

const auth = Router();

auth.post('/register', catchError(authController.register));
auth.post('/login', catchError(authController.login));
auth.get('/activation/:activationToken', catchError(authController.activate));
auth.get('/refresh', catchError(authController.refresh));
auth.post('/logout', catchError(authController.logout));

auth.post('/reset-password', catchError(authController.resetPassword));

auth.post(
  '/reset-password/:resetPasswordToken',
  catchError(authController.confirmResetPassword),
);

auth.get(
  '/reset-password/:resetPasswordToken',
  catchError(authController.checkResetToken),
);

export default auth;
