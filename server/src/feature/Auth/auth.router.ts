import cookieParser from 'cookie-parser';
import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

export const authRouter = Router();

authRouter.post('/registration', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/activation/:email/:token', authMiddleware, authController.activate);
authRouter.get('/refresh', cookieParser(), authController.refresh);
authRouter.post('/logout', authMiddleware, authController.logout);
authRouter.get('/is-activated', cookieParser(), authController.checkActivaton);

authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password/:token', authController.resetPassword);
