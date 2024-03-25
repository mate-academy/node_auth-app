import express from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRouter = new express.Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activate/:activationToken', authController.activate);

authRouter.get('/login', authController.loginGet);
authRouter.post('/login', authController.loginPost);
authRouter.post('/logout', authController.logout);
