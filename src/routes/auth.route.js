import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../middlewares/catch-error.middleware.js';
import { isAuth, storeLinkIntent } from '../middlewares/auth.middleware.js';
import { isNotAuth } from '../middlewares/guest.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authValidation } from '../validations/auth.validation.js';
import {
  authLimiter,
  exchangeLimiter,
} from '../middlewares/rate-limit.middleware.js';
import passport from '../utils/passport.js';

export const authRouter = express.Router();

authRouter.post(
  '/registration',
  isNotAuth,
  authLimiter,
  validate(authValidation.register),
  catchError(authController.register),
);

authRouter.get(
  '/activate/:activationToken',
  isNotAuth,
  catchError(authController.activate),
);

authRouter.post(
  '/login',
  isNotAuth,
  authLimiter,
  validate(authValidation.login),
  catchError(authController.login),
);
authRouter.post('/refresh', catchError(authController.refresh));

authRouter.post(
  '/auth/exchange',
  exchangeLimiter,
  catchError(authController.exchangeCode),
);
authRouter.post('/logout', isAuth, catchError(authController.logout));

authRouter.post(
  '/reset-password',
  isNotAuth,
  authLimiter,
  validate(authValidation.requestPasswordReset),
  catchError(authController.requestPasswordReset),
);

authRouter.post(
  '/reset-password/:passwordResetToken',
  isNotAuth,
  validate(authValidation.confirmPasswordReset),
  catchError(authController.confirmPasswordReset),
);

authRouter.get(
  '/activate-new-email/:pendingEmailToken',
  catchError(authController.confirmEmailChange),
);

// Social auth — login / register
authRouter.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email'] }),
);

authRouter.get(
  '/auth/google/callback',
  authController.socialCallback('google'),
);

authRouter.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] }),
);

authRouter.get(
  '/auth/facebook/callback',
  authController.socialCallback('facebook'),
);

authRouter.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
);

authRouter.get(
  '/auth/github/callback',
  authController.socialCallback('github'),
);

// Social auth — link to existing account
authRouter.get(
  '/link/google',
  storeLinkIntent,
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

authRouter.get(
  '/link/facebook',
  storeLinkIntent,
  passport.authenticate('facebook', { scope: ['email'] }),
);

authRouter.get(
  '/link/github',
  storeLinkIntent,
  passport.authenticate('github', { scope: ['user:email'] }),
);
