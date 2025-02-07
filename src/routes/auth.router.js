'use strict';

const express = require('express');
const authController = require('../controllers/auth.controller');
const catchError = require('../utils/catchError');

const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activate/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
authRouter.post('/reset-password', catchError(authController.reset));

authRouter.post(
  '/update-password/:updateToken',
  catchError(authController.update),
);

module.exports = authRouter;
