import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', authController.register);

router.get('/activate/:activationToken', authController.activate);

router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password', authController.resetPassword);

router.post('/logout', authMiddleware, authController.logout);

router.patch('/profile/name', authMiddleware, authController.updateProfileName);

router.patch(
  '/profile/password',
  authMiddleware,
  authController.updatePassword,
);

router.patch('/profile/email', authMiddleware, authController.updateEmail);

export default router;
