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
  generateEmailChangeToken,
  changeEmail,
} = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');
const { authMiddleware } = require('../middlewares/authMiddleware');

const authRouter = new express.Router();

authRouter.post(
  '/registration',
  catchError(authMiddleware),
  catchError(register),
);
authRouter.get(
  '/activation/:activationToken',
  catchError(authMiddleware),
  catchError(activate),
);
authRouter.post('/login', catchError(authMiddleware), catchError(login));
authRouter.get('/refresh', catchError(authMiddleware), catchError(refresh));
authRouter.post('/logout', catchError(authMiddleware), catchError(logout));
authRouter.post(
  '/changePassword',
  catchError(authMiddleware),
  catchError(resetPassword),
);
authRouter.post(
  '/changeAuthPassword',
  catchError(authMiddleware),
  catchError(changeAuthPass),
);
authRouter.post('/reset', catchError(authMiddleware), catchError(reset));
authRouter.get(
  '/reset/:resetToken',
  catchError(authMiddleware),
  catchError(resetChecker),
);
authRouter.patch(
  '/update',
  catchError(authMiddleware),
  catchError(updateUserName),
);
authRouter.patch(
  '/confirmChangeEmail',
  catchError(authMiddleware),
  catchError(changeEmail),
);

module.exports = {
  authRouter,
};
