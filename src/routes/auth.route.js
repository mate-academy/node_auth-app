const express = require('express');
const {
  register,
  activate,
  login,
  refresh,
  logout,
} = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');

const authRouter = new express.Router();

authRouter.post('/registration', catchError(register));
authRouter.get('/activation/:activationToken', catchError(activate));
authRouter.post('/login', catchError(login));
authRouter.get('/refresh', catchError(refresh));
authRouter.post('/logout', catchError(logout));

module.exports = {
  authRouter,
};
