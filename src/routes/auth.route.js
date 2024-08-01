const express = require('express');
const {
  register,
  activate,
  login,
  refresh,
  logout,
  reset,
  resetPassword,
  resetChecker,
  updateUserName,
  changeAuthPass,
  changeEmail,
} = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');

const authRouter = new express.Router();

authRouter.post('/registration', catchError(register));
authRouter.get('/activation/:activationToken', catchError(activate));
authRouter.post('/login', catchError(login));
authRouter.get('/refresh', catchError(refresh));
authRouter.post('/logout', catchError(logout));
authRouter.post('/changePassword', catchError(resetPassword));
authRouter.post('/changeAuthPassword', catchError(changeAuthPass));
authRouter.post('/reset', catchError(reset));
authRouter.get('/reset/:resetToken', catchError(resetChecker));
authRouter.patch('/update', catchError(updateUserName));
authRouter.patch('/confirmChangeEmail', catchError(changeEmail));

module.exports = {
  authRouter,
};
