import express from 'express';
import { authController } from '../routes/auth.route.js';

export const authRouter = new express.Router();

authRouter.post('/registration', authController.register);
