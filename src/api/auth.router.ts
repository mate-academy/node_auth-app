import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { authController } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activation/:email/:token', authController.activate);
authRouter.post('/login', authController.login);
authRouter.get('/refresh', cookieParser(), authController.refresh);
authRouter.post('/logout', cookieParser(), authController.logout);
authRouter.post('/password-reset-request', authController.requestPasswordReset);
authRouter.post('/password-reset/:email/:token', authController.resetPassword);
