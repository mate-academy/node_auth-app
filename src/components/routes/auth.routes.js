'use strict';

const express = require('express');
const passport = require('passport');

const AuthController = require('../auth/auth.controller');
const catchError = require('../../utils/catch-error');

const AuthRouter = express.Router();

AuthRouter.post('/register', catchError(AuthController.register));
AuthRouter.post('/activate', catchError(AuthController.activate));
AuthRouter.post('/login', catchError(AuthController.logIn));
AuthRouter.post('/refresh', catchError(AuthController.refresh));
AuthRouter.delete('/logout', catchError(AuthController.logOut));
AuthRouter.patch('/reset-password', catchError(AuthController.resetPassword));

AuthRouter.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

module.exports = AuthRouter;
