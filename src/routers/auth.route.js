import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import * as tokenController from '../controllers/token.controller.js';

const authRouter = express.Router();

authRouter.post('/registration', authController.register);
authRouter.get('/activate/:activationToken', authController.activate);
authRouter.post('/login', authController.login);
authRouter.get('/profile', authMiddleware, authController.loadProfile);

authRouter.patch(
  '/profile/password',
  authMiddleware,
  authController.changePassword,
);
authRouter.post('/refresh', tokenController.refreshAccessToken);
authRouter.post('/logout', authController.logout);
authRouter.post('/reset-password', authController.requestPasswordReset);
authRouter.patch('/reset', authController.resetPassword);

export default authRouter;
