import express from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRouter = new express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/activate/:token', authController.activate);
router.post('/password-reset', authController.requestPasswordReset);


