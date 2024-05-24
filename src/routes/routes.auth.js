'use strict';

const express = require('express');
const { authController } = require('../controllers/auth.controller');
const {
  middlewareCheckSignInDataRes,
} = require('../middleware/middlewareCheckSignInDataRes.js');
const { errorWrapperAsync } = require('../middleware/errorWrapperAsync.js');

const routeAuth = new express.Router();

routeAuth.get(
  '/registration',
  errorWrapperAsync(authController.getRegistrationForm),
);

routeAuth.post(
  '/registration',
  middlewareCheckSignInDataRes,
  errorWrapperAsync(authController.registration),
);

routeAuth.get(
  '/activation/:activationToken',
  errorWrapperAsync(authController.activation),
);

routeAuth.get('/login', errorWrapperAsync(authController.getloginPage));

routeAuth.post('/login', errorWrapperAsync(authController.login));

routeAuth.post('/logout/:userId', errorWrapperAsync(authController.logout));

module.exports = {
  routeAuth,
};
