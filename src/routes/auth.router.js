const express = require('express');
const authController = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');
const { noAuthMiddleware } = require('../middlewares/noAuth.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');

const authRouter = new express.Router();

authRouter.post(
  '/registration',
  noAuthMiddleware,
  catchError(authController.register),
);

authRouter.get(
  '/activation/:activationToken',
  noAuthMiddleware,
  catchError(authController.activate),
);

authRouter.post('/login', noAuthMiddleware, catchError(authController.login));

authRouter.get(
  '/refresh',
  noAuthMiddleware,
  catchError(authController.refresh),
);

authRouter.post('/logout', authMiddleware, catchError(authController.logout));

authRouter.patch(
  '/passReset',
  noAuthMiddleware,
  catchError(authController.passReset),
);

authRouter.get(
  '/passResetConfirmation/:accessToken',
  noAuthMiddleware,
  catchError(authController.passResetConfirm),
);

module.exports = {
  authRouter,
};
