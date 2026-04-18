import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = express.Router()

authRouter.post('/registration', catchError(authController.register));
authRouter.get('/activate/:email/:activationToken', catchError(authController.activate));
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
authRouter.post('/forgot-password', catchError(authController.requestResetPassword));
authRouter.post('/reset-password/:token', catchError(authController.resetPassword));
