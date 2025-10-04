import { Router } from 'express';
import { catchError } from '../utils/catch-error.js';
import { authController } from '../controllers/auth-controller.js';
import {
  isAuthenticated,
  isNotAuthenticated,
} from '../middlewares/auth-middlewares.js';

export const authRouter = new Router();

authRouter.post(
  '/registration',
  isNotAuthenticated,
  catchError(authController.register),
);

authRouter.get(
  '/activation/:activationToken',
  isNotAuthenticated,
  catchError(authController.activate),
);

authRouter.post('/login', isNotAuthenticated, catchError(authController.login));

authRouter.post('/logout', isAuthenticated, catchError(authController.logout));

authRouter.post(
  '/refresh',
  isAuthenticated,
  catchError(authController.refresh),
);

authRouter.post(
  '/password-reset',
  isNotAuthenticated,
  catchError(authController.requestPasswordReset),
);

authRouter.post(
  '/password-reset/:token',
  isNotAuthenticated,
  catchError(authController.resetPassword),
);

authRouter.get('/profile', isAuthenticated, catchError(authRouter.getProfile));

authRouter.patch(
  '/profile/name',
  isAuthenticated,
  catchError(authRouter.updateName),
);

authRouter.patch(
  '/profile/email',
  isAuthenticated,
  catchError(authRouter.updateEmail),
);

authRouter.patch(
  '/profile/password',
  isAuthenticated,
  catchError(authRouter.updatePassword),
);
