import cookieParser from 'cookie-parser';
import { Router } from 'express';
import { authController } from './auth.controller.js';
import { catchError } from '../../utils/catchError.js';

export const authRouter = Router();

authRouter.post('/registration', catchError(authController.register));
authRouter.post('/login', authController.login);
authRouter.get('/activation/:email/:token', catchError(authController.activate));
authRouter.get('/refresh', cookieParser(), catchError(authController.refresh));
authRouter.post('/logout', cookieParser(), catchError(authController.logout));

authRouter.post('/forgot-password', catchError(authController.forgotPassword));
authRouter.post('/reset-password/:token', catchError(authController.resetPassword));
