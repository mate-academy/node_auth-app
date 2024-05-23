const express = require('express');
const authController = require('../controllers/auth.controller.js');
const { catchError } = require('../utils/catchError.js');

const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.registr));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);

authRouter.post('/login', catchError(authController.login));

authRouter.post('/logout', catchError(authController.logout));

authRouter.get('/refresh', catchError(authController.refresh));

authRouter.post(
  '/request-password-reset',
  catchError(authController.requestPasswordReset),
);

authRouter.post(
  '/reset-password/:resetPasswordToken',
  catchError(authController.resetPassword),
);

module.exports = { authRouter };
