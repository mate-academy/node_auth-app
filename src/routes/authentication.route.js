const authRouter = require('express').Router();
const authController = require('../controllers/authentication.controller.js');
const { catchError } = require('../utils/catchError.js');

authRouter.post('/registration', catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  catchError(authController.activate),
);
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
authRouter.post('/password-reset', catchError(authController.sendResetEmail));

authRouter.post(
  '/password-reset/:resetToken',
  catchError(authController.resetPassword),
);

module.exports = authRouter;
