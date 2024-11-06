const express = require('express');
const authController = require('../controllers/auth.controller.js');
const catchError = require('../utils/catchError.js');

const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);

authRouter.post('/login', catchError(authController.login));

authRouter.get('/refresh', catchError(authController.refresh));

authRouter.get('/logout', catchError(authController.logout));

authRouter.post('/pwdReset/', catchError(authController.reqPwdReset));

authRouter.get(
  '/pwdReset/:pwdResetToken',
  catchError(authController.validatePwResetToken),
);

authRouter.post(
  '/pwdReset/:pwdResetToken',
  catchError(authController.pwdReset),
);

module.exports = authRouter;
