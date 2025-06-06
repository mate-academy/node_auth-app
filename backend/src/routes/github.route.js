import express from 'express';
import passport from 'passport';
import { catchError } from '../utils/catchError.js';
import { authController } from '../controllers/auth.controller.js';

export const githubAuthRouter = express.Router();

githubAuthRouter.get(
  '/github',
  passport.authenticate('github', {
    scope: ['user:email'],
    session: false,
  }),
);

githubAuthRouter.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/',
    session: false,
  }),
  catchError(authController.githubAuth),
);
