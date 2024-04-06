const express = require('express');
const { catchError } = require('../middlewars/catchErrorMiddleware.js');
const authController = require('../controllers/auth.controller.js');

const authRouter = express.Router();

authRouter.post('/registration', catchError(authController.register));
authRouter.get('/activation/:token', catchError(authController.activate));
authRouter.post('/login', catchError(authController.login));
authRouter.post('/logout', catchError(authController.logout));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/change-password', catchError(authController.changePassword));
authRouter.post('/reset-password', catchError(authController.resetPassword));

module.exports = {
  authRouter,
};
