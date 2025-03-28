'use strict';

const express = require('express');
const { catchError } = require('../middlewares/catchError.js');
const { authController } = require('../controllers/auth.controller.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const passport = require('passport');

const authRouter = express.Router();

authRouter.post('/register', catchError(authController.register));

authRouter.get(
  '/activate/:activationToken',
  catchError(authController.activate)
);
authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout/:userId', catchError(authController.logout));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/forgot-password', catchError(authController.forgotPassword));

authRouter.get(
  '/reset-password/:resetToken',
  catchError(authController.resetPassword)
);

authRouter.patch(
  '/update-name/:id',
  catchError(authMiddleware),
  catchError(authController.updateName)
);

authRouter.patch(
  '/update-password/:id',
  catchError(authMiddleware),
  catchError(authController.updatePassword)
);

authRouter.post(
  '/send-confirmation-email/:id',
  catchError(authMiddleware),
  catchError(authController.sendEmailConfirmation)
);

authRouter.patch(
  '/update-email/:confirmationToken',
  catchError(authMiddleware),
  catchError(authController.updateEmail)
);

authRouter.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    accessType: 'offline',
    prompt: 'consent',
  }),
  catchError()
);

authRouter.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  catchError(authController.authorizeWithGoogle)
);

authRouter.get(
  '/auth/google/logout/:userId',
  catchError(authController.logoutWithGoogle)
);

module.exports = { authRouter };
