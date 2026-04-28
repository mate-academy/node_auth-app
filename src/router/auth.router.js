import express from 'express';
import { authController } from '../controller/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.mildware.js';

const router = express.Router();

router.post('/auth', authController.registerUser);
router.get('/activate/:activationToken', authController.activateUser);
router.post('/login', authController.loginUser);
router.get('/refresh', authController.refresh);
router.get('/logout', authController.logout);
router.post('/forgot', authController.forgot);
router.post('/password-reset/:resetToken', authController.resetPassword);
router.get('/profile', authMiddleware, authController.getProfile);

export default router;
