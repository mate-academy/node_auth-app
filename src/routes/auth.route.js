import express from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRouter = express.Router();

authRouter.post('/registration', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/reset-password-request', authController.resetPasswordRequest);
authRouter.post('/reset-password-confirm/:token', authController.resetPasswordConfirm);
