import express from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRoute = express.Router();

authRoute.post('/registration', authController.register);
authRoute.get('/activation/:activationToken', authController.activate);
authRoute.post('/login', authController.login);
authRoute.get('/refresh', authController.refresh);
authRoute.post('/logout', authController.logout);
authRoute.post('/reset-password', authController.requestPasswordReset);
authRoute.post('/reset-password/:resetToken', authController.resetPassword);
