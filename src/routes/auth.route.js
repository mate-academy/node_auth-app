import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchErrors } from '../utils/catchErrors.js';
import { guestMiddleware } from '../middleware/guestMiddleware.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const authRouter = new express.Router();

authRouter.post(
  '/registration',
  guestMiddleware,
  catchErrors(authController.register),
);

authRouter.get(
  '/activation/:activationToken',
  guestMiddleware,
  catchErrors(authController.activate),
);
authRouter.post('/login', guestMiddleware, catchErrors(authController.login));

authRouter.get(
  '/refresh',
  guestMiddleware,
  catchErrors(authController.refresh),
);

authRouter.post('/logout', authMiddleware, catchErrors(authController.logout));

authRouter.post(
  '/reset-password',
  guestMiddleware,
  catchErrors(authController.resetPasswordRequest),
);

authRouter.get(
  '/reset-password/:resetToken',
  guestMiddleware,
  catchErrors(authController.confirmPasswordChange),
);

authRouter.post(
  '/reset-password-confirm',
  guestMiddleware,
  catchErrors(authController.passwordChange),
);
