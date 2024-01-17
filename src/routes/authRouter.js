'use strict';

const express = require('express');
const authController = require('../controllers/auth.controller');
const { catchError } = require('../middlewares/catchError.middleware');

const authRouter = express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate
  ));

authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout', catchError(authController.logout));
authRouter.post('/refresh', catchError(authController.refresh));
authRouter.post('/reset-password', catchError(authController.resetPassword));

authRouter.get(
  '/reset-confirm',
  catchError(authController.resetPasswordConfirm));

module.exports = authRouter;
