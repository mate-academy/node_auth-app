import express from 'express';
import { authController } from '../controller/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { guestMiddleware } from '../middlewares/guest.middleware.js';

const router = express.Router();

router.post('/auth', guestMiddleware, authController.registerUser);

router.get(
  '/activate/:activationToken',
  guestMiddleware,
  authController.activateUser,
);
router.post('/login', guestMiddleware, authController.loginUser);
router.post('/forgot', guestMiddleware, authController.forgot);

router.post(
  '/password-reset/:resetToken',
  guestMiddleware,
  authController.resetPassword,
);

router.get('/logout', authMiddleware, authController.logout);

export default router;
