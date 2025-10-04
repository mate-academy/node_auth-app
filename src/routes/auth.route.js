import express from 'express';

import { authController } from '../controllers/authController.js';

export const authRouter = new express.Router();

authRouter.post('/register', authController.register);

authRouter.get('/activation/:activationToken', authController.activate);

authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/refresh', authController.refresh);
