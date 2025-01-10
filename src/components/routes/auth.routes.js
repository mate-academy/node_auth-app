'use strict';

const express = require('express');
const passport = require('passport');

const AuthController = require('../auth/auth.controller');
const catchError = require('../../utils/catch-error');

const AuthRouter = express.Router();

AuthRouter.post('/register', catchError(AuthController.register));
AuthRouter.post('/activate', AuthController.activate);
AuthRouter.post('/login', catchError(AuthController.logIn));
AuthRouter.post('/refresh', AuthController.refresh);
AuthRouter.delete('/logout', AuthController.logOut);
AuthRouter.patch('/reset-password', AuthController.resetPassword);

AuthRouter.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

module.exports = AuthRouter;
