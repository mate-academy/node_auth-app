import express from 'express';
import { catchError } from '../middlewares/catchError.js';
import { authController } from '../controllers/authController.js';
import passport from 'passport';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout', catchError(authController.logout));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.get('/sentEmail', catchError(authController.forgotPassword));
authRouter.post('/reset/:resetToken', catchError(authController.resetPassword));
authRouter.post('/nameChange', catchError(authController.nameChange));
authRouter.post('/passwordChange', catchError(authController.passwordChange));

authRouter.get(
  '/login/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
  catchError(async (req, res) => {
    const user = req.user;

    await authController.sendAuthentication(res, user, true);
  }),
);

authRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: false,
  }),
  function (req, res) {
    res.redirect(process.env.CLIENT_URL);
  },
);

authRouter.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  catchError(async (req, res) => {
    const user = req.user;

    await authController.sendAuthentication(res, user, true);
  }),
);

authRouter.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: `${process.env.CLIENT_ULR}/login`,
    session: false,
  }),
  function (req, res) {
    res.redirect(process.env.CLIENT_URL);
  },
);
