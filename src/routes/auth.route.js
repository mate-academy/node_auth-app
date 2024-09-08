const express = require('express');
const authController = require('../controllers/auth.controller.js');
const { catchError } = require('../utils/catch.error.js');

const authRouter = express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.get('/logout', catchError(authController.logout));

authRouter.post(
  '/reset-password-request',
  catchError(authController.resetPasswordStart),
);

authRouter.get(
  '/reset-password-confirm/:resetToken',
  catchError(authController.resetPasswordConfirmEmail),
);

authRouter.post('/reset-password', catchError(authController.resetPassword));

module.exports = {
  authRouter,
};
