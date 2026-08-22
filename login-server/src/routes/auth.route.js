import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../moddlewares/auth.middleware.js';

export const authRouter = new express.Router();

authRouter.post('/register', authController.register);
authRouter.get('/activate', authController.activate);
authRouter.post('/login', authController.login);
authRouter.get('/profile', authMiddleware, authController.getProfile);
