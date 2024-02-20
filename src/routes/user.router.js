'use strict';

const express = require('express');
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { catchError } = require('../middlewares/catchError');

const userRouter = express.Router();

userRouter.post(
  '/change-username', authMiddleware,
  catchError(userController.changeUsername)
);

userRouter.post(
  '/change-password', authMiddleware,
  catchError(userController.changePassword)
);

userRouter.post(
  '/change-email', authMiddleware,
  catchError(userController.requestEmailChange)
);

userRouter.get(
  '/change-email', authMiddleware,
  catchError(userController.changeEmail)
);

module.exports = { userRouter };
