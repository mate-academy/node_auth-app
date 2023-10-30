'use strict';

const express = require('express');

const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../utils/catchError');
const {
  validateNameMiddleware,
} = require('../middlewares/validateNameMiddleware');
const {
  validatePasswordMiddleware,
} = require('../middlewares/validatePasswordMiddleware');
const {
  validateEmailMiddleware,
} = require('../middlewares/validateEmailMiddleware');

const userRouter = new express.Router();

userRouter.get('/:id', authMiddleware, catchError(userController.getUser));

userRouter.patch(
  '/update_name/:id',
  authMiddleware,
  validateNameMiddleware,
  catchError(userController.updateName)
);

userRouter.patch(
  '/update_password/:id',
  authMiddleware,
  validatePasswordMiddleware,
  catchError(userController.updatePassword)
);

userRouter.patch(
  '/update_email/:id',
  authMiddleware,
  validateEmailMiddleware,
  catchError(userController.updateEmail)
);

module.exports = {
  userRouter,
};
