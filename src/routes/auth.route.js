const express = require('express');
const {
  register,
  activation,
  login,
  refresh,
  logout,
  changeEmail,
  changePassword,
  changeName,
  addNewEmail,
  resetPassword,
  addNewPassword,
} = require('../controllers/auth.controller.js');
const { catchError } = require('../utils/catchError.js');
const { nonAuthMiddleware } = require('../middlewares/nonAuthMiddleware.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');

const authRouter = new express.Router();

authRouter.post('/registration', nonAuthMiddleware, catchError(register));

authRouter.get(
  '/activate/:activationToken',
  nonAuthMiddleware,
  catchError(activation),
);
authRouter.post('/login', nonAuthMiddleware, catchError(login));
authRouter.get('/refresh', catchError(refresh));
authRouter.get('/logout', catchError(logout));
authRouter.get('/reset-password', nonAuthMiddleware, catchError(resetPassword));

authRouter.post(
  '/reset-password/:resetToken',
  nonAuthMiddleware,
  catchError(addNewPassword),
);
authRouter.get('/change-email', catchError(addNewEmail));

authRouter.post(
  '/change-email/:resetToken',
  authMiddleware,
  catchError(changeEmail),
);

authRouter.post('/change-password', authMiddleware, catchError(changePassword));
authRouter.post('/change-name', authMiddleware, catchError(changeName));

module.exports = {
  authRouter,
};
