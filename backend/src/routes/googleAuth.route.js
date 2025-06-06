import express from 'express';
import passport from 'passport';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const googleAuthRouter = express.Router();

googleAuthRouter.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }),
);

googleAuthRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
    session: false,
  }),
  catchError(authController.googleAuth),
);
