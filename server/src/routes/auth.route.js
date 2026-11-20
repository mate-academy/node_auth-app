import express from 'express';
import { authController } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
import { guestMiddleware } from '../middlewares/gutestMiddleware.js';

export const authRouter = new express.Router();

authRouter.post('/registration', guestMiddleware, catchError(authController.register));
authRouter.get('/activation/:activationToken', guestMiddleware, catchError(authController.activate));
authRouter.post('/login', guestMiddleware, catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));
authRouter.patch('/password', authMiddleware, catchError(authController.password));
authRouter.post('/reset-password', guestMiddleware, catchError(authController.resetPassword));
authRouter.patch('/reset-password', guestMiddleware, catchError(authController.resetPasswordConfirm));