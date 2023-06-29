'use strict';

const express = require('express');
const { authController } = require('./controllers/authController.js');
const { catchError } = require('../utils/catchError');

const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken', catchError(authController.activate)
);

authRouter.post('/login', catchError(authController.login));

authRouter.post('/logout', catchError(authController.logout));

authRouter.get('/refresh', catchError(authController.refresh));

authRouter.post('/restore', catchError(authController.sendRestorePasswordLink));

authRouter.post(
  '/restore/:restorePasswordToken', catchError(authController.checkRestoreCode)
);

authRouter.post('/change-password', catchError(authController.changePassword));

module.exports = { authRouter };
