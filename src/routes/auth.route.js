import express from 'express';
import passport from '../passport/passport.js';

import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const authRouter = express.Router();

authRouter.post('/register', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);

authRouter.post('/login', catchError(authController.login));

authRouter.post('/refresh', catchError(authController.refresh));

authRouter.post('/logout', authMiddleware, catchError(authController.logout));

authRouter.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);

authRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
  }),
  catchError(authController.loginGoogle),
);

authRouter.get(
  '/github',
  passport.authenticate('github', {
    scope: ['user:email'],
  }),
);

authRouter.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
  }),
  catchError(authController.loginGithub),
);
