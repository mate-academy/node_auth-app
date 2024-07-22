const express = require('express');
const { authController } = require('../controlles/auth.controller.js');
const { catchError } = require('../utils/catchError.js');

 const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));

authRouter.post(
  '/request-password-reset',
  catchError(authController.requestPasswordReset),
);

authRouter.post(
  '/password-reset/:passwordResetToken',
  catchError(authController.passwordReset),
);


module.exports = {
  authRouter,

};
