const { Router } = require('express');
const { authController } = require('../controllers');
const { authMiddleware, guestMiddleware } = require('../middlewares');
const { catchError } = require('../utils');

const authRouter = Router();

authRouter.post(
  '/registration',
  guestMiddleware,
  catchError(authController.register),
);

authRouter.get(
  '/activate/:activationToken',
  guestMiddleware,
  catchError(authController.activate),
);

authRouter.post('/login', guestMiddleware, catchError(authController.login));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));
authRouter.get('/refresh', catchError(authController.refresh));

authRouter.post(
  '/reset-password',
  guestMiddleware,
  catchError(authController.resetPassword),
);

authRouter.post(
  '/reset-password/:token',
  guestMiddleware,
  catchError(authController.resetPasswordConfirmation),
);

module.exports = authRouter;
