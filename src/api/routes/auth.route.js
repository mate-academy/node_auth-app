const express = require('express');
const { authController } = require('../controller/auth.controller');
const { catchError } = require('../utils/catchError');
const cookieParser = require('cookie-parser');

const authRouter = express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get('/activate/:email/:token', catchError(authController.activate));

authRouter.post('/login', catchError(authController.login));

authRouter.get('/refresh', cookieParser(), catchError(authController.refresh));

authRouter.post('/logout', cookieParser(), catchError(authController.refresh));

module.exports = {
  authRouter,
};
