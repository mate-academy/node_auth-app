'use strict';

const express = require('express');
const { authController } = require('../controllers/authController.js');
const { checkActTokenMW } = require('../middlewares/checkActTokenMW.js');
const { catchErrorMW } = require('../middlewares/catchErrorMW.js');
const {
  ACTIVATION_ACCOUNT_WAY,
  ACTIVATION_PASSWORD_WAY,
} = require('../defaultConfig.js');

const authRouter = new express.Router();

authRouter.post('/register', catchErrorMW(authController.register));

authRouter.post(
  `/${ACTIVATION_ACCOUNT_WAY}/:activetionToken`,
  catchErrorMW(checkActTokenMW),
  catchErrorMW(authController.activate),
);

authRouter.post('/login', catchErrorMW(authController.login));
authRouter.post('/logout', catchErrorMW(authController.logout));
authRouter.get('/refresh', catchErrorMW(authController.refresh));
authRouter.get('/check', catchErrorMW(authController.check));

authRouter.post('/forgot', catchErrorMW(authController.forgot));

authRouter.post(
  `/${ACTIVATION_PASSWORD_WAY}/:activetionToken`,
  catchErrorMW(checkActTokenMW),
  catchErrorMW(authController.resetPassword),
);

module.exports = { authRouter };
