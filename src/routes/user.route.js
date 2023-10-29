'use strict';

const express = require('express');

const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../utils/catchError');

const userRouter = new express.Router();

userRouter.get('/:id', authMiddleware, catchError(userController.getUser));

userRouter.patch(
  '/update_name/:id',
  authMiddleware,
  catchError(userController.updateName)
);

userRouter.patch(
  '/update_password/:id',
  authMiddleware,
  catchError(userController.updatePassword)
);

userRouter.patch(
  '/update_email/:id',
  authMiddleware,
  catchError(userController.updateEmail)
);

module.exports = {
  userRouter,
};
