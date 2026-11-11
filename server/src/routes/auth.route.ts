import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

export const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.get('/activate/:activationToken', authController.activate);
authRouter.post('/login', authController.login);

authRouter.get('/refresh', authController.refresh);
authRouter.post('/logout', authMiddleware, authController.logout);

authRouter.post('/reset-password', authController.requestPasswordReset);
authRouter.post('/reset-password/:resetToken', authController.resetPassword);
