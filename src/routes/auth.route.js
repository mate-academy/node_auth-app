const express = require('express');
const { authController } = require('../controllers/auth.controller.js');
const { catchError } = require('../utils/catchError.js');
const { guestOnly } = require('../middlewares/guestOnly.js');
const { authOnly } = require('../middlewares/authOnly.js');

const authRouter = new express.Router();

authRouter.post(
  '/registration',
  guestOnly,
  catchError(authController.register),
);

authRouter.get(
  '/activation/:activationToken',
  guestOnly,
  catchError(authController.activate),
);
authRouter.post('/login', guestOnly, catchError(authController.login));
authRouter.post('/logout', authOnly, catchError(authController.logout));
authRouter.post('/refresh', catchError(authController.refresh));
authRouter.post('/password-reset', guestOnly, catchError(authController.reset));

authRouter.post(
  '/password-reset/:token',
  guestOnly,
  catchError(authController.reset),
);

module.exports = { authRouter };
