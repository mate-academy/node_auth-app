require('dotenv/config');

const express = require('express');
const { catchError } = require('../middlewars/catchErrorMiddleware.js');
const authController = require('../controllers/auth.controller.js');
const passport = require('passport');
const authRouter = express.Router();

authRouter.post('/registration', catchError(authController.register));
authRouter.get('/activation/:token', catchError(authController.activate));
authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout', catchError(authController.logout));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/reset-password', catchError(authController.resetPassword));

authRouter.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile'],
  }),
);

authRouter.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: process.env.CLIENT_URL + '/login',
  }),
);

authRouter.get(
  '/github',
  passport.authenticate('github', {
    scope: ['profile'],
  }),
);

authRouter.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: '/login/failed',
  }),
);

authRouter.post(
  '/restore-password',
  catchError(authController.restorePassword),
);

module.exports = {
  authRouter,
};
