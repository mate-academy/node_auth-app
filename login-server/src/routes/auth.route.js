'use strict';

const express = require('express');
const {
  register, activate, login, refresh,
} = require('../controllers/auth.controller.js');
const { catchError } = require('../utils/catchError');
const { logout } = require('../controllers/auth.controller');

const authRouter = new express.Router();

authRouter.post('/register', catchError(register));
authRouter.get('/activation/:activationToken', catchError(activate));
authRouter.post('/login', catchError(login));
authRouter.post('/refresh', catchError(refresh));
authRouter.post('/logout', catchError(logout));

module.exports = {
  authRouter,
};
