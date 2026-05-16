import { Router } from 'express';
import { authController } from './auth.controller.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

export const authRoutes = Router();

authRoutes.post('/register', asyncHandler(authController.register));
authRoutes.get('/activate/:token', asyncHandler(authController.activate));
authRoutes.post('/login', asyncHandler(authController.login));
authRoutes.post('/logout', authMiddleware, authController.logout);

authRoutes.post(
  '/forgot-password',
  asyncHandler(authController.forgotPassword),
);

authRoutes.post(
  '/reset-password/:token',
  asyncHandler(authController.resetPassword),
);
