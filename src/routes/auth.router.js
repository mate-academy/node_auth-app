import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import cookieParser from 'cookie-parser';

export const authRouter = Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activation/:activationToken', authController.activate);
authRouter.post('/login', authController.login);
authRouter.get('/refresh', cookieParser(), authController.refresh);
authRouter.post('/logout', authController.logout);
