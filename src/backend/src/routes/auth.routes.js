'use strict';

const express = require('express');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { guestOnlyMiddleware } = require('../middlewares/guestOnlyMiddleware');

const authRouter = express.Router();

authRouter.post('/register', guestOnlyMiddleware, authController.register);
authRouter.post('/login', guestOnlyMiddleware, authController.login);
authRouter.post('/logout', authMiddleware, authController.logout);

authRouter.post(
  '/auth/github/start',
  guestOnlyMiddleware,
  authController.startGithubAuthentication,
);

authRouter.post(
  '/auth/github/link/start',
  authMiddleware,
  authController.startGithubLink,
);
authRouter.get('/auth/github', authController.githubAuthenticate);
authRouter.get('/auth/github/callback', authController.githubCallback);

authRouter.post(
  '/password-reset',
  guestOnlyMiddleware,
  authController.requestPasswordReset,
);

authRouter.post(
  '/password-reset/confirm',
  guestOnlyMiddleware,
  authController.resetPassword,
);
authRouter.get('/activate/:hash', authController.activate);

authRouter.get(
  '/email-change/confirm/:token',
  authController.confirmEmailChange,
);

module.exports = { authRouter };
