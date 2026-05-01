import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { guestMiddleware } from '../middlewares/guest.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const authRouter = Router();

authRouter.post(
  '/registration',
  guestMiddleware,
  catchError(authController.register),
);

authRouter.get(
  '/activation/:email/:token',
  guestMiddleware,
  catchError(authController.activate),
);

authRouter.post('/login', guestMiddleware, catchError(authController.login));
authRouter.get('/refresh', authMiddleware, catchError(authController.refresh));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));

authRouter.post(
  '/reset-password',
  guestMiddleware,
  catchError(authController.requestPasswordReset),
);

authRouter.post(
  '/reset-password/:email/:token',
  guestMiddleware,
  catchError(authController.resetPassword),
);
