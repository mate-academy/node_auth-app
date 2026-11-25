import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const authRouter = new express.Router();

authRouter.get('/registration', authController.getRegister);
authRouter.post('/registration', authController.register);
authRouter.get('/activation', authController.getActivation);
authRouter.get('/activate/:activationToken', authController.activate);

authRouter.get('/login', authController.getLogin);
authRouter.post('/login', authController.login);
authRouter.get('/profile', authMiddleware, authController.getProfile);

authRouter.get('/logout', authController.logout);

authRouter.post('/profile/name', authMiddleware, authController.updateName);
authRouter.post('/profile/email', authMiddleware, authController.updateEmail);

authRouter.get('/changePassword', authController.getChangePassword);
authRouter.post('/changePassword', authController.changePassword);

authRouter.get('/reset', authController.getReset);
authRouter.post('/reset', authController.reset);
authRouter.get('/resetSent', authController.resetSent);
authRouter.get('/reset/:token', authController.getNewPassword);
authRouter.post('/reset/:token', authController.setNewPassword);
authRouter.get('/resetSuccess', authController.getResetSuccess);
