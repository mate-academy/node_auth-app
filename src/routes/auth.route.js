'use strict';

const express = require('express');
const { authController } = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');

const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get('/activation/:activationToken',
  catchError(authController.activate));
authRouter.post('/login', catchError(authController.login));

module.exports = {
  authRouter,
};
