const express = require('express');

const authRouter = new express.Router();
const { authController } = require('../controllers/auth.controller.js');
const { catchError } = require('../utils/catchError.js');

authRouter.post('/registration', catchError(authController.registration));

authRouter.get(
  '/activate/:activationToken',
  catchError(authController.activate),
);

authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));

authRouter.post(
  '/auth/forgot-password',
  catchError(authController.sendPassResetLink),
);

authRouter.post(
  '/auth/reset-password',
  catchError(authController.resetPassword),
);

module.exports = { authRouter };
