const express = require('express');
const { catchError } = require('../utils/catchError');
const { authController } = require('../controllers/auth.controller');

const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation:activationToken',
  catchError(authController.activate),
);
authRouter.get('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.get('/logout', catchError(authController.logout));

module.exports = { authRouter };
