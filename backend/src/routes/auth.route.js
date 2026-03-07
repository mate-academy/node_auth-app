import express from 'express';
import {
  authController,
  generateTokens,
} from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
import passport from '../utils/passport.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activate/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.get('/logout', catchError(authController.logout));
authRouter.post('/forgot-password', catchError(authController.forgotPassword));

authRouter.post(
  '/reset-password/:token',
  catchError(authController.resetPassword),
);

authRouter.get(
  '/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    session: false,
  }),
);

authRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  async (req, res) => {
    const { accessToken } = await generateTokens(res, req.user);

    res.redirect(
      `${process.env.CLIENT_HOST}/profile?accessToken=${accessToken}`,
    );
  },
);
