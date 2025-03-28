const express = require('express');
const { authController } = require('../controllers/auth.controller.js');
const { catchError } = require('../middlewares/catchMiddleware.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');

const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);

authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));
authRouter.get('/refresh', authMiddleware, catchError(authController.refresh));
authRouter.post('/reset', catchError(authController.reset));

authRouter.post(
  '/resetPassword/:resetToken',
  catchError(authController.resetPassword),
);

module.exports = { authRouter };
