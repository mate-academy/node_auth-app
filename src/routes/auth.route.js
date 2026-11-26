import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { guestMiddleware } from '../middlewares/guestMiddleware.js';

export const authRouter = new express.Router();

authRouter.get('/registration', guestMiddleware, authController.getRegister);
authRouter.post('/registration', guestMiddleware, authController.register);
authRouter.get('/activation', guestMiddleware, authController.getActivation);
authRouter.get('/activate/:activationToken', authController.activate);

authRouter.get('/login', guestMiddleware, authController.getLogin);
authRouter.post('/login', guestMiddleware, authController.login);
authRouter.get('/profile', authMiddleware, authController.getProfile);

authRouter.get('/logout', authMiddleware, authController.logout);

authRouter.post('/profile/name', authMiddleware, authController.updateName);
authRouter.post('/profile/email', authMiddleware, authController.updateEmail);

authRouter.get(
  '/changePassword',
  authMiddleware,
  authController.getChangePassword,
);

authRouter.post(
  '/changePassword',
  authMiddleware,
  authController.changePassword,
);

authRouter.get('/reset', guestMiddleware, authController.getReset);
authRouter.post('/reset', guestMiddleware, authController.reset);
authRouter.get('/resetSent', guestMiddleware, authController.resetSent);
authRouter.get('/reset/:token', guestMiddleware, authController.getNewPassword);

authRouter.post(
  '/reset/:token',
  guestMiddleware,
  authController.setNewPassword,
);

authRouter.get(
  '/resetSuccess',
  guestMiddleware,
  authController.getResetSuccess,
);
