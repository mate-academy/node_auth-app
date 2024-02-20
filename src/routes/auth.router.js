'use strict';

const express = require('express');
const authController = require('../controllers/auth.controller');
const { catchError } = require('../middlewares/catchError');

const authRouter = express.Router();

authRouter.post('/register', catchError(authController.register));
authRouter.get('/activation', catchError(authController.activate));
authRouter.post('/login', catchError(authController.login));

authRouter.post('/confirmation',
  catchError(authController.requestEmailConfirmation));
authRouter.get('/confirmation', catchError(authController.confirmReset));
authRouter.post('/reset-password', catchError(authController.resetPassword));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.get('/logout', catchError(authController.logout));

module.exports = { authRouter };
