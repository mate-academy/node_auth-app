'use strict';

const express = require('express');
const { authController } = require('../controllers/auth.controller.js');
const { catchError } = require('../utils/catch.error.js');
const {
  emailAndPasswordValidation,
  nameValidation,
} = require('../middlewares/validation.middleware.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');

const authRoute = express.Router();

authRoute.post(
  '/register',
  catchError(emailAndPasswordValidation),
  catchError(nameValidation),
  catchError(authController.register)
);

authRoute.get(
  '/activate/:activationToken',
  catchError(authController.activate)
);
authRoute.get('/refresh', catchError(authController.refresh));

authRoute.post(
  '/login',
  catchError(emailAndPasswordValidation),
  catchError(authController.login)
);

authRoute.post(
  '/logout',
  catchError(authMiddleware),
  catchError(authController.logout)
);
authRoute.post('/reset', catchError(authController.reset));
authRoute.post('/reset/:resetToken', catchError(authController.confirmReset));

exports.authRoute = authRoute;
