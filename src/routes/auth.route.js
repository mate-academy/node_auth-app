const express = require('express');
const { authController } = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');
const { authMiddleware } = require('../midlleware/authMiddleware');
const { guestMiddleware } = require('../midlleware/guestMiddleware');

const authRouter = express.Router();

authRouter.post(
  '/registration',
  guestMiddleware,
  catchError(authController.register),
);

authRouter.get(
  '/activation/:activationToken',
  guestMiddleware,
  catchError(authController.activate),
);
authRouter.post('/login', guestMiddleware, catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));

module.exports = { authRouter };
