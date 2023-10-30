'use strict';

const express = require('express');
const authController = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');
const {
  checkEmailInRequestBody,
} = require('../middlewares/checkEmailInRequestBody');
const {
  checkRefreshTokenInCookies,
} = require('../middlewares/checkRefreshTokenInCookies');
const {
  checkRestoreCodeInParams,
} = require('../middlewares/checkRestoreCodeInParams');
const {
  validateRegistrationInput,
} = require('../middlewares/validateRegistrationInput');

const authRouter = new express.Router();

authRouter.post(
  '/registration',
  validateRegistrationInput,
  catchError(authController.register)
);

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate)
);
authRouter.post('/login', catchError(authController.login));

authRouter.get('/refresh',
  checkRefreshTokenInCookies,
  catchError(authController.refresh)
);

authRouter.post('/logout',
  checkRefreshTokenInCookies,
  catchError(authController.logout)
);

authRouter.post('/restore',
  checkEmailInRequestBody,
  catchError(authController.restorePassword)
);

authRouter.get(
  '/restore/:restoreCode',
  checkRestoreCodeInParams,
  catchError(authController.useRestore)
);

authRouter.post('/change_password', catchError(authController.changePassword));

module.exports = {
  authRouter,
};
