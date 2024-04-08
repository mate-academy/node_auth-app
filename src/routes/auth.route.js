const express = require('express');
const { catchError } = require('../middlewars/catchErrorMiddleware.js');
const authController = require('../controllers/auth.controller.js');
const passport = require('passport');

const authRouter = express.Router();

authRouter.post('/registration', catchError(authController.register));
authRouter.get('/activation/:token', catchError(authController.activate));
authRouter.post('/login', catchError(authController.login));

authRouter.get(
  '/google',
  catchError(
    passport.authenticate('google', {
      scope: ['profile'],
    }),
  ),
);
authRouter.get('/google/redirect', catchError(authController.googleRedirect));
authRouter.post('/logout', catchError(authController.logout));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/reset-password', catchError(authController.resetPassword));

authRouter.post(
  '/restore-password',
  catchError(authController.restorePassword),
);

module.exports = {
  authRouter,
};
