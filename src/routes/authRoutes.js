'use strict';

const express = require('express');
const authController = require('../controllers/authController.js');
const { catchError } = require('../utils/catchError.js');
const { validRegMiddlewere } = require('../middlewares/authMiddleware.js');

const authRouter = new express.Router();

authRouter.post(
  '/registration',
  validRegMiddlewere,
  catchError(authController.register)
);

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate)
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
authRouter.post('/reset', catchError(authController.resetPass));

authRouter.post(
  '/new_password/:resetToken',
  catchError(authController.setPassword)
);

module.exports = {
  authRouter,
};
