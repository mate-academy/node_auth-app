'use strict';

const express = require('express');
const { authController } = require('../controllers/auth.controller');
const {
  middlewareCheckSignInDataRes,
} = require('../middleware/middlewareCheckSignInDataRes.js');
const { errorWrapper } = require('../middleware/errorWrapper.js');

const authRoutes = new express.Router();

authRoutes.get(
  '/registration',
  errorWrapper(authController.getRegistrationForm),
);

authRoutes.post(
  '/registration',
  middlewareCheckSignInDataRes,
  errorWrapper(authController.registration),
);

authRoutes.get(
  '/activation/:activationToken',
  errorWrapper(authController.activation),
);

authRoutes.get('/login', errorWrapper(authController.getloginPage));

authRoutes.post('/login', errorWrapper(authController.login));

authRoutes.post('/logout/:userId', errorWrapper(authController.logout));

module.exports = {
  authRoutes,
};
