const express = require('express');
const {
  register,
  activate,
  login,
  refresh,
  logout,
  sendResetEmail,
  resetPassword,
} = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');

const authRouter = express.Router();

authRouter.post('/registration', catchError(register));
authRouter.get('/activation/:activationToken', catchError(activate));
authRouter.post('/login', catchError(login));
authRouter.get('/refresh', catchError(refresh));
authRouter.post('/logout', catchError(logout));
authRouter.post('/password-reset', catchError(sendResetEmail));
authRouter.post('/password-reset/:resetToken', catchError(resetPassword));

module.exports = authRouter;
