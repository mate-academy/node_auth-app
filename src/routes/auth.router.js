'use strict';

const express = require('express');
const { authController } = require('../controllers/auth.controller.js');
const { catchError } = require('../utils/catch.error.js');
const {
  reqBodyValidation,
  additionalValidation,
} = require('../middlewares/validation.middleware.js');

const authRoute = express.Router();

authRoute.post(
  '/register',
  catchError(reqBodyValidation),
  catchError(additionalValidation),
  catchError(authController.register)
);

exports.authRoute = authRoute;
