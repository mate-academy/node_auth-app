import express from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRouter = new express.Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activation/:activationToken', authController.activate);
authRouter.get('/refreshToken', authController.refresh);
authRouter.post('/login', authController.login);
// authRouter.post('/refresh', authController.refresh);
