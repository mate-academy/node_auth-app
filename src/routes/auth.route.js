import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/signup', authController.signup);
router.post('/activate', authController.activate);
router.post('/reset-link', authController.passwordResetLink);
router.post('/reset', authController.passwordReset);
router.post('/signin', authController.signin);
router.delete('/revoke', authMiddleware, authController.revoke);

export default router;
