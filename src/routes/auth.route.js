'use strict';

const express = require('express');

const { authController } = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');

const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get('/activation/:activationToken',
  catchError(authController.activate));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout', catchError(authController.logout));

authRouter.get('/confirm-new-email/:confirmationToken',
  catchError(authController.confirmNewEmail));

authRouter.post('/reset-password', catchError(authController.resetPassword));

authRouter.post('/reset-password/:confirmationResetToken',
  catchError(authController.confirmationResetPassword));

module.exports = {
  authRouter,
};
