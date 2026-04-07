const express = require('express');
const authController = require('../controllers/auth.controller.js');
const catchError = require('../utils/catchError.js');

const authRoute = new express.Router();

authRoute.post('/registration', catchError(authController.registration));
authRoute.post('/login', catchError(authController.login));

authRoute.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);

authRoute.get('/refresh', catchError(authController.refresh));
authRoute.post('/logout', catchError(authController.logout));

authRoute.post('/forgot-password', catchError(authController.forgotPassword));
authRoute.post('/reset-password', catchError(authController.resetPassword));

module.exports = { authRoute };
