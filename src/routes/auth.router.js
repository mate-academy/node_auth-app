/* eslint-disable no-console */
'use strict';

const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { catchError } = require('../middlewares/catchError');

require('../utils/passport');
require('dotenv').config();

const authRouter = express.Router();

authRouter.post('/register', catchError(authController.register));

authRouter.get('/activate', catchError(authController.activate));

authRouter.post('/login', catchError(authController.login));

authRouter.post('/confirm-reset',
  catchError(authController.requestPasswordReset));

authRouter.get('/confirm-reset',
  catchError(authController.confirmPasswordReset));

authRouter.post('/reset-password', catchError(authController.resetPassword));

authRouter.get('/confirm-email-change',
  catchError(authController.confirmEmailChange));

authRouter.get('/refresh', catchError(authController.refresh));

authRouter.get('/logout', catchError(authController.logout));

authRouter.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }));

authRouter.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: `${process.env.CLIENT_HOST}/auth-callback`,
    failureRedirect: `${process.env.CLIENT_HOST}/login`,
  }),
);

authRouter.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email', 'read:user'] }));

authRouter.get('/auth/github/callback',
  passport.authenticate('github', {
    successRedirect: `${process.env.CLIENT_HOST}/auth-callback`,
    failureRedirect: `${process.env.CLIENT_HOST}/login`,
  }),
);

authRouter.get('/connect/google',
  passport.authorize('connectGoogle'));

authRouter.get('/connect/google/callback',
  passport.authorize('connectGoogle', {
    failureRedirect: `${process.env.CLIENT_HOST}/profile`,
  }),
  catchError(authController.addSocialAccount));

authRouter.get('/connect/github',
  passport.authorize('connectGithub'));

authRouter.get('/auth/github/callback/connect',
  passport.authorize('connectGithub', {
    failureRedirect: `${process.env.CLIENT_HOST}/profile`,
  }),
  catchError(authController.addSocialAccount));

module.exports = { authRouter };
