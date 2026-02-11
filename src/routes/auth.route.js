import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../middlewares/catch-error.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { checkNotLoggedIn } from '../middlewares/check-login.middleware.js';

export const authRouter = express.Router();

authRouter.post(
  '/registration',
  checkNotLoggedIn,
  catchError(authController.register),
);

authRouter.get(
  '/activate/:activationToken',
  checkNotLoggedIn,
  catchError(authController.activate),
);
authRouter.post('/login', checkNotLoggedIn, catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));

authRouter.post(
  '/reset-password',
  checkNotLoggedIn,
  catchError(authController.resetPasswordNotification),
);

authRouter.post(
  '/reset-password/:passwordResetToken',
  checkNotLoggedIn,
  catchError(authController.confirmPasswordReset),
);

authRouter.get(
  '/activate-new-email/:pendingEmailToken',
  catchError(authController.confirmEmailChange),
);
