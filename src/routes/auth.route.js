import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { guestMiddleware } from '../middleware/guest.middleware.js';

export const authRoute = express.Router();

// Only for NOT authenticated users
authRoute.post('/registration', guestMiddleware, authController.register);

authRoute.get(
  '/activation/:activationToken',
  guestMiddleware,
  authController.activate,
);

authRoute.post('/login', guestMiddleware, authController.login);

authRoute.post(
  '/reset-password',
  guestMiddleware,
  authController.requestPasswordReset,
);

authRoute.post(
  '/reset-password/:resetToken',
  guestMiddleware,
  authController.resetPassword,
);

// Works with the refresh token from the cookie,
// when the access token may already be expired
authRoute.get('/refresh', authController.refresh);

// Only for authenticated users
authRoute.post('/logout', authMiddleware, authController.logout);
