import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = new express.Router();

router.post('/registration', authController.register);
router.post('/activate/:email/:activationToken', authController.activate);
router.post('/login', authController.login);
router.post('/activation-link', authController.resendActivationLink);
router.post('/refresh', authController.refresh);
router.post('/logout', authMiddleware, authController.logout);
router.post('/password-reset-requests', authController.passwordResetRequest);
router.post('/password-reset', authController.passwordReset);

export const authRouter = router;
