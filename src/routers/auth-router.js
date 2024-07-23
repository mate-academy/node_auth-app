const express = require('express');
const { authController } = require('../controllers/auth-controller.js');
const { catchError } = require('../utils/catch-error.js');
const { guestMiddleware } = require('../middlewares/guest-middleware.js');
const { authMiddleware } = require('../middlewares/auth-middleware.js');

const authRouter = new express.Router();

authRouter.post(
  '/registration',
  catchError(guestMiddleware),
  catchError(authController.register),
);

authRouter.get(
  '/activation/:activationToken',
  catchError(guestMiddleware),
  catchError(authController.activate),
);

authRouter.get('/refresh', catchError(authController.refresh));

authRouter.post(
  '/login',
  catchError(guestMiddleware),
  catchError(authController.login),
);

authRouter.post(
  '/logout',
  catchError(authMiddleware),
  catchError(authController.logout),
);

authRouter.post(
  '/reset',
  catchError(guestMiddleware),
  catchError(authController.resetRequest),
);

authRouter.post(
  '/reset/:resetToken',
  catchError(guestMiddleware),
  catchError(authController.resetPassword),
);

module.exports = {
  authRouter,
};
