'use strict';

const { Router } = require('express');

const authController = require('../controllers/auth');
const { catchError } = require('../middlewares/catchError');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = new Router();

router
  .post('/registration', catchError(authController.register))
  .get('/activation/:activationToken', catchError(authController.activate))
  .post('/login', catchError(authController.login))
  .post('/logout', catchError(authController.logout))
  .post('/reset', catchError(authController.reset))
  .post('/set-password', catchError(authController.setPassword))
  .get('/refresh', catchError(authController.refresh))
  .patch(
    '/user/:userId',
    catchError(authMiddleware),
    catchError(authController.patch),
  )
  .post(
    '/user/:userId/delete',
    catchError(authMiddleware),
    catchError(authController.remove),
  );

module.exports = {
  router,
};
