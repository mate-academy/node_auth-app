const express = require('express');

const { AuthController } = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');
const { authMiddleware } = require('../middlewares/auth.middleware');

const authRouter = express.Router();

authRouter.post('/registration', catchError(AuthController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(AuthController.activate),
);

authRouter.post('/login', catchError(AuthController.login));

authRouter.get('/refresh', catchError(AuthController.refresh));

authRouter.post(
  '/logout',
  catchError(authMiddleware),
  catchError(AuthController.logout),
);

authRouter.post('/forgot-password', catchError(AuthController.forgotPassword));

authRouter.post(
  '/reset-password/:activationToken',
  catchError(AuthController.resetPassword),
);

module.exports = { authRouter };
