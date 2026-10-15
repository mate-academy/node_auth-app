import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activate/:activationToken', authController.activate);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/reset-password', authController.requestPasswordReset);
authRouter.get('/reset-password/success', authController.resetSuccess);
authRouter.get('/reset-password/:resetToken', authController.checkResetToken);
authRouter.post('/reset-password/confirm', authController.confirmPasswordReset);
