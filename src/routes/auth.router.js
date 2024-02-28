'use strict';

const express = require('express');
const authController = require('../controllers/auth.controller');
const { catchError } = require('../middlewares/catchError');

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

module.exports = { authRouter };
