'use strict';

const { Router } = require('express');

const authController = require('../controllers/auth');
const { catchError } = require('../middlewares/catchError');

const router = new Router();

router
  .post('/registration', catchError(authController.register))
  .get('/activation/:activationToken', catchError(authController.activate))
  .post('/login', catchError(authController.login))
  .post('/logout', catchError(authController.logout))
  .get('/refresh', catchError(authController.refresh));

module.exports = {
  router,
};
