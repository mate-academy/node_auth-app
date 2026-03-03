import express from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRouter = express.Router();

authRouter.post('/registration', authController.registration);
authRouter.get('/activate/:token', authController.activate);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
authRouter.post('/refresh', authController.refreshenToken);
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password', authController.resetPassword);
authRouter.patch('/profile/password', authController.updatePassword);
authRouter.patch('/profile/email', authController.emailUpdate);
authRouter.patch('/profile/name', authController.updateName);
