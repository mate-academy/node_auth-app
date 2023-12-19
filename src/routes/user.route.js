'use strict';

const express = require('express');
const { userController } = require('../controllers/user.controller.js');
const { catchError } = require('../utils/catch.error.js');
const { authMiddleware } = require('../middlewares/auth.middleware.js');

const userRoute = express.Router();

userRoute.patch(
  '/name',
  catchError(authMiddleware),
  catchError(userController.updateName)
);

userRoute.patch(
  '/email',
  catchError(authMiddleware),
  catchError(userController.updateEmail)
);

userRoute.patch(
  '/password',
  catchError(authMiddleware),
  catchError(userController.updatePassword)
);

exports.userRoute = userRoute;
