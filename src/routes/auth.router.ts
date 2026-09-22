import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import cookieParser from 'cookie-parser';

export const authRouter = Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activation/:email/:token', authController.activate);
authRouter.post('/login', authController.login);
authRouter.get('/refresh', cookieParser(), authController.refresh);
authRouter.post('/logout', cookieParser(), authController.logout);
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password/:token', authController.resetPassword);
authRouter.get('/email-confirmation/:token', authController.confirmEmailChange);
