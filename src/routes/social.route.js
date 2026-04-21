const { Router } = require('express');
const passport = require('passport');
const { socialController } = require('../controllers');
const { catchError } = require('../utils');

const socialRouter = Router();

socialRouter.get(
  '/auth/google',
  passport.authenticate('google', { session: false }),
);

socialRouter.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login?error=auth_failed',
  }),
  catchError(socialController.oauthCallback),
);

socialRouter.get(
  '/auth/facebook',
  passport.authenticate('facebook', { session: false, scope: ['email'] }),
);

socialRouter.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: '/login?error=auth_failed',
  }),
  catchError(socialController.oauthCallback),
);

socialRouter.get(
  '/auth/github',
  passport.authenticate('github', { session: false }),
);

socialRouter.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: '/login?error=auth_failed',
  }),
  catchError(socialController.oauthCallback),
);

module.exports = socialRouter;
