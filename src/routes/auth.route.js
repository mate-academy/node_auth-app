const express = require('express');
const { authController } = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');
const { guestMiddleware } = require('../middlewares/guestMiddleware');
const { authMiddleware } = require('../middlewares/authMiddleware');

const authRouter = express.Router();

authRouter.post(
  '/register',
  guestMiddleware,
  catchError(authController.register),
);

authRouter.get(
  '/activate/:activationToken',
  guestMiddleware,
  catchError(authController.activate),
);

authRouter.post('/login', guestMiddleware, catchError(authController.login));
authRouter.get('/refresh', authMiddleware, catchError(authController.refresh));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));

authRouter.post(
  '/reset-password',
  guestMiddleware,
  catchError(authController.passwordReset),
);

authRouter.get(
  '/reset-password/:token',
  guestMiddleware,
  catchError(authController.verifyResetToken),
);

authRouter.post(
  '/reset-password/:token',
  guestMiddleware,
  catchError(authController.updatePassword),
);

module.exports = { authRouter };
