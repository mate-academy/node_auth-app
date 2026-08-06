import express from 'express';
import { authController } from './auth.controller.js';
import { catchError } from '../../utils/catchError.js';
import { guestMiddleware } from '../../middlewares/guestMiddleware.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const { Router } = express;

const auth = Router();

// Guest-only routes (blocked for authenticated users)
auth.post('/register', guestMiddleware, catchError(authController.register));
auth.post('/login', guestMiddleware, catchError(authController.login));

auth.get(
  '/activation/:activationToken',
  guestMiddleware,
  catchError(authController.activate),
);

auth.post(
  '/reset-password',
  guestMiddleware,
  catchError(authController.resetPassword),
);

auth.post(
  '/reset-password/:resetPasswordToken',
  guestMiddleware,
  catchError(authController.confirmResetPassword),
);

auth.get(
  '/reset-password/:resetPasswordToken',
  guestMiddleware,
  catchError(authController.checkResetToken),
);

auth.get('/refresh', authMiddleware, catchError(authController.refresh));
auth.post('/logout', authMiddleware, catchError(authController.logout));

export default auth;
