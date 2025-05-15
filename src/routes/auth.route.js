const { Router } = require('express');
const { authController } = require('../controllers/auth.controller.js');
const { catchError } = require('../utils/catchError.js');

const authRouter = Router();

authRouter.post('/registration', catchError(authController.registrate));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
authRouter.post('/reset', catchError(authController.resetPassword));

authRouter.post(
  '/reset/:resetToken',
  catchError(authController.confirmPassword),
);

module.exports = { authRouter };
