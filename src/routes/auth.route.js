const express = require('express');

const { catchError } = require('../utils/catchError');

const authController = require('../controllers/auth.controller');
const { nonAuthMiddleware } = require('../middlewares/auth.middleware');

const authRouter = new express.Router();

authRouter.post(
  '/register',
  nonAuthMiddleware,
  catchError(authController.register),
);

authRouter.get(
  '/activate/:token',
  nonAuthMiddleware,
  catchError(authController.activate),
);

authRouter.post('/login', nonAuthMiddleware, catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.get('/logout', catchError(authController.logout));

module.exports = {
  authRouter,
};
