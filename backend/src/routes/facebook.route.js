import express from 'express';
import passport from 'passport';
import { catchError } from '../utils/catchError.js';
import { authController } from '../controllers/auth.controller.js';

export const facebookAuthRouter = express.Router();

facebookAuthRouter.get(
  '/facebook',
  passport.authenticate('facebook', {
    scope: ['email'],
    session: false,
  }),
);

facebookAuthRouter.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/',
    session: false,
  }),
  catchError(authController.facebookAuth),
);
