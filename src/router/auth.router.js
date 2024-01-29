'use strict';

const express = require('express');
const { register, activate, login, refresh, logout, resetPassword, resetPasswordConfirm } = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');
const authRouter = express.Router();

authRouter.post('/register', catchError(register));
authRouter.get('/activation/:activationToken',catchError(activate));
authRouter.post('/login', catchError(login));
authRouter.get('/refresh', catchError(refresh));
authRouter.post('/logout', catchError(logout));
authRouter.post('/reset-password', catchError(resetPassword));
authRouter.get('/reset-confirm', catchError(resetPasswordConfirm));


module.exports = {
  authRouter,
};
