'use strict';

import express from 'express';
import { catchError } from '../utils/catchError.js';
import authController from '../controllers/authController.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get('/activation/:activationToken',
  catchError(authController.activate));
authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout', catchError(authController.logout));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/reset', catchError(authController.reset));

authRouter.post('/reset/:resetToken',
  catchError(authController.resetPassword));

authRouter.post('/change-name', catchError(authController.changeName));
authRouter.post('/change-email', catchError(authController.changeEmail));
authRouter.post('/change-password', catchError(authController.changePassword));

authRouter.get('/authenticate/google',
  catchError(authController.authWithGoogle));

authRouter.get('/connect/google',
  catchError(authController.connectGoogle));

authRouter.get('/disconnect-google',
  catchError(authController.disconnectGoogle));
