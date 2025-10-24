const express = require('express');
const { authController } = require('../controllers/auth.controller.js');
const { catchError } = require('../utils/catchError.js');

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.registration));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
authRouter.post('/forgot-password', catchError(authController.forgotPassword));

authRouter.post(
  '/reset-password/:token',
  catchError(authController.resetPassword),
);
