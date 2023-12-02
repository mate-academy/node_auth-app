'use strict';

const express = require('express');

const { catchError } = require('../middlewares/catchError');
const { authMiddleware } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const userRouter = new express.Router();

userRouter.patch(
  '/name',
  catchError(authMiddleware),
  catchError(userController.updateName),
);

userRouter.patch(
  '/email',
  catchError(authMiddleware),
  catchError(userController.updateEmail),
);

userRouter.patch(
  '/password',
  catchError(authMiddleware),
  catchError(userController.updatePassword),
);

module.exports = { userRouter };
